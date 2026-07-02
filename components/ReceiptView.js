"use client";

import { useEffect, useState } from "react";
import { b64decode, shortHash } from "../lib/codec";
import { getDisclosureIntro, getDisclosureItems } from "../lib/disclosure";
import DisclosureBadge from "./DisclosureBadge";

export default function ReceiptView({ d, mode = "route" }) {
  const [payload, setPayload] = useState(null);
  const [rid, setRid] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const p = b64decode(d);
      setPayload(p);
      shortHash(d).then(setRid);
    } catch (e) {
      setError(true);
    }
  }, [d]);

  if (error) {
    return (
      <>
        <h1>Receipt unreadable</h1>
        <p className="hint">This link&rsquo;s disclosure data couldn&rsquo;t be decoded.</p>
      </>
    );
  }

  if (!payload) {
    return <h1>Loading&hellip;</h1>;
  }

  const isViewMode = mode === "view";
  const disclosureItems = getDisclosureItems(payload);

  return (
    <>
      <h1 className="disclosure-intro">{getDisclosureIntro(payload)}</h1>

      <DisclosureBadge items={disclosureItems} rid={rid} />

      {payload.note && <p className="hint disclosure-note">&ldquo;{payload.note}&rdquo;</p>}

      <div className="disclaimer">
        Self-attested. Not independently verified. This receipt records only what the author
        reported checking, and carries no cryptographic or platform guarantee.
      </div>

      {!isViewMode && payload.target && (
        <div className="target-line">Continuing to: {payload.target}</div>
      )}

      {isViewMode ? (
        payload.target && (
          <a className="article-link" href={payload.target}>
            Open article &rarr;
          </a>
        )
      ) : (
        <button
          className="primary continue-btn"
          onClick={() => {
            if (payload.target) window.location.href = payload.target;
          }}
        >
          Continue to article
        </button>
      )}
    </>
  );
}
