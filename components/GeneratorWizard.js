"use client";

import { useState } from "react";
import { SCOPES } from "../lib/scopes";
import { b64encode, shortHash } from "../lib/codec";

export default function GeneratorWizard() {
  const [step, setStep] = useState(1);
  const [scopes, setScopes] = useState({});
  const [none, setNone] = useState(false);
  const [target, setTarget] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [generatedRid, setGeneratedRid] = useState("");

  const selectedKeys = Object.keys(scopes).filter((k) => scopes[k]);

  function toggleScope(key) {
    if (none) return;
    setScopes((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleNone() {
    setNone((prev) => {
      const next = !prev;
      if (next) setScopes({});
      return next;
    });
  }

  async function generateLink() {
    const payload = {
      version: "0.1",
      generated_at: new Date().toISOString(),
      scopes: none ? ["none"] : selectedKeys,
      none,
      target,
      attestation: "self-attested",
      verified: false,
    };
    const d = b64encode(payload);
    const rid = await shortHash(d);
    const base = window.location.origin + window.location.pathname;
    setGeneratedUrl(`${base}?d=${d}`);
    setGeneratedRid(rid);
    setStep(4);
  }

  function startOver() {
    setStep(1);
    setScopes({});
    setNone(false);
    setTarget("");
    setGeneratedUrl("");
    setGeneratedRid("");
  }

  function copyLink() {
    navigator.clipboard.writeText(generatedUrl);
  }

  return (
    <>
      {step < 4 && <div className="step-indicator">Step {step} of 3</div>}
      <h1>Here&rsquo;s how I use AI</h1>

      {step === 1 && (
        <Step1
          none={none}
          scopes={scopes}
          toggleScope={toggleScope}
          toggleNone={toggleNone}
          onContinue={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <Step2
          target={target}
          setTarget={setTarget}
          onBack={() => setStep(1)}
          onContinue={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <Step3
          none={none}
          selectedKeys={selectedKeys}
          target={target}
          onBack={() => setStep(2)}
          onGenerate={generateLink}
        />
      )}
      {step === 4 && (
        <Step4
          none={none}
          generatedUrl={generatedUrl}
          generatedRid={generatedRid}
          onCopy={copyLink}
          onStartOver={startOver}
        />
      )}
    </>
  );
}

function Step1({ none, scopes, toggleScope, toggleNone, onContinue }) {
  const selectedCount = Object.values(scopes).filter(Boolean).length;
  return (
    <>
      <div className="step-title">What role did AI play?</div>
      <div className="scope-list">
        {SCOPES.map((s) => (
          <label key={s.key} className={`scope-item${none ? " disabled" : ""}`}>
            <input
              type="checkbox"
              checked={!!scopes[s.key]}
              disabled={none}
              onChange={() => toggleScope(s.key)}
            />
            <div className="scope-copy">
              <span className="key">{s.key}</span>
              <div className="desc">{s.desc}</div>
              <div className="example">{s.example}</div>
            </div>
          </label>
        ))}
      </div>
      <div className="divider-or">or</div>
      <label className="scope-item">
        <input type="checkbox" checked={none} onChange={toggleNone} />
        <div className="scope-copy">
          <span className="key">none</span>
          <div className="desc">No AI involvement at any stage.</div>
        </div>
      </label>
      <div className="actions end">
        <button className="primary" disabled={!none && selectedCount === 0} onClick={onContinue}>
          Continue
        </button>
      </div>
    </>
  );
}

function Step2({ target, setTarget, onBack, onContinue }) {
  return (
    <>
      <div className="step-title">Link to the article</div>
      <p className="hint">Where should readers land after they continue?</p>
      <input
        type="url"
        placeholder="https://yourblog.com/your-article"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
      />
      <div className="actions">
        <button className="link-back" onClick={onBack}>&larr; Back</button>
        <button className="primary" disabled={!target} onClick={onContinue}>Review</button>
      </div>
    </>
  );
}

function Step3({ none, selectedKeys, target, onBack, onGenerate }) {
  const items = none ? ["none"] : selectedKeys;
  return (
    <>
      <div className="step-title">Confirm before generating</div>
      <ul className="review-list">
        {items.map((k) => (
          <li key={k}>{k}</li>
        ))}
      </ul>
      <div className="target-line">Article: {target}</div>
      <div className="disclaimer">
        This will generate a link readers see before reaching your article. It is self-attested
        only &mdash; no verification is performed.
      </div>
      <div className="actions">
        <button className="link-back" onClick={onBack}>&larr; Back</button>
        <button className="primary" onClick={onGenerate}>Generate link</button>
      </div>
    </>
  );
}

function Step4({ none, generatedUrl, generatedRid, onCopy, onStartOver }) {
  const [copied, setCopied] = useState(false);
  return (
    <>
      <div className="step-title center-text">Link ready</div>
      <div className="status-line">
        {none ? "None" : "Disclosed"} <span className="rid">&middot; #{generatedRid}</span>
      </div>
      <p className="hint center-text">
        Share this instead of your article link directly &mdash; it routes readers through the
        disclosure first.
      </p>
      <label className="field-label">Consent link</label>
      <div className="link-box">
        <input type="text" readOnly value={generatedUrl} />
        <button
          onClick={() => {
            onCopy();
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="actions">
        <button className="link-back" onClick={onStartOver}>Start over</button>
        <a href={generatedUrl} target="_blank" rel="noopener noreferrer">
          <button className="primary">Preview as reader</button>
        </a>
      </div>
    </>
  );
}
