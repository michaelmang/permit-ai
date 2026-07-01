"use client";

import { useEffect, useState } from "react";
import { SCOPES } from "../lib/scopes";
import { b64decode, shortHash } from "../lib/codec";

export default function ReceiptView({ d }) {
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

  const isNone = payload.none === true;
  const scopeItems = isNone
    ? []
    : (payload.scopes || []).map((k) => SCOPES.find((s) => s.key === k)).filter(Boolean);

  return (
    <>
      <h1>{isNone ? "No AI was used" : "How AI was used"}</h1>

      <div className="status-line">
        {isNone ? "None" : "Disclosed"} <span className="rid">&middot; #{rid}</span>
      </div>

      {isNone ? (
        <p className="hint center-text">
          The author attests this piece was written without AI involvement at any stage.
        </p>
      ) : (
        <ul className="review-list">
          {scopeItems.map((s) => (
            <li key={s.key}>{s.key}</li>
          ))}
        </ul>
      )}

      {payload.note && <p className="hint">&ldquo;{payload.note}&rdquo;</p>}

      <div className="disclaimer">
        Self-attested. Not independently verified. This receipt records only what the author
        reported checking, and carries no cryptographic or platform guarantee.
      </div>

      {payload.target && <div className="target-line">Continuing to: {payload.target}</div>}

      <button
        className="primary continue-btn"
        onClick={() => {
          if (payload.target) window.location.href = payload.target;
        }}
      >
        Continue to article
      </button>
    </>
  );
}
