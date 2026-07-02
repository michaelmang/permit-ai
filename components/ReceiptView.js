"use client";

import { useEffect, useState } from "react";
import { b64decode } from "../lib/codec";
import { getDisclosureIntro, getDisclosureItems } from "../lib/disclosure";
import DisclosureBadge from "./DisclosureBadge";

export default function ReceiptView({ d, mode = "route" }) {
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      setPayload(b64decode(d));
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
    <div data-testid="reader-receipt">
      <h1 className="disclosure-intro">{getDisclosureIntro(payload)}</h1>

      <DisclosureBadge items={disclosureItems} testId="reader-disclosure-badge" />

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
          <a className="article-link" href={payload.target} data-testid="reader-open-article">
            Open article &rarr;
          </a>
        )
      ) : (
        <button
          className="primary continue-btn"
          data-testid="reader-continue"
          onClick={() => {
            if (payload.target) window.location.href = payload.target;
          }}
        >
          Continue to article
        </button>
      )}
    </div>
  );
}
