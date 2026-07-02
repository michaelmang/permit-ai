"use client";

import { useEffect, useState } from "react";
import { SCOPES } from "../lib/scopes";
import { b64encode, b64decode } from "../lib/codec";
import { buildConsentUrl } from "../lib/links";
import { buildDisclosureBadgeSvg, downloadBadgeSvg } from "../lib/badge";
import { getDisclosureItems } from "../lib/disclosure";
import DisclosureBadge from "./DisclosureBadge";
import { buildScopeSuggestionUrl } from "../lib/github";
import { isValidHttpUrl } from "../lib/validation";
import { shortenUrl } from "../lib/shorten";

export default function GeneratorWizard() {
  const [step, setStep] = useState(1);
  const [scopes, setScopes] = useState({});
  const [none, setNone] = useState(false);
  const [target, setTarget] = useState("");
  const [generatedRouteUrl, setGeneratedRouteUrl] = useState("");
  const [generatedViewUrl, setGeneratedViewUrl] = useState("");
  const [encodedPayload, setEncodedPayload] = useState("");

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
      target: target.trim(),
      attestation: "self-attested",
      verified: false,
    };
    const d = b64encode(payload);
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    setEncodedPayload(d);
    setGeneratedRouteUrl(buildConsentUrl(origin, pathname, d));
    setGeneratedViewUrl(buildConsentUrl(origin, pathname, d, { mode: "view" }));
    setStep(4);
  }

  function startOver() {
    setStep(1);
    setScopes({});
    setNone(false);
    setTarget("");
    setGeneratedRouteUrl("");
    setGeneratedViewUrl("");
    setEncodedPayload("");
  }

  function copyLink(url) {
    navigator.clipboard.writeText(url);
  }

  return (
    <>
      {step < 4 && <div className="step-indicator">Step {step} of 3</div>}
      <h1>Here&rsquo;s how I used AI</h1>

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
          generatedRouteUrl={generatedRouteUrl}
          generatedViewUrl={generatedViewUrl}
          encodedPayload={encodedPayload}
          onCopy={copyLink}
          onStartOver={startOver}
        />
      )}
    </>
  );
}

function Step1({ none, scopes, toggleScope, toggleNone, onContinue }) {
  const selectedCount = Object.values(scopes).filter(Boolean).length;
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestKey, setSuggestKey] = useState("");
  const [suggestDesc, setSuggestDesc] = useState("");
  const [suggestExample, setSuggestExample] = useState("");

  return (
    <div data-testid="wizard-step-1">
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
      <div className="scope-suggest">
        <button
          type="button"
          className="link-back"
          data-testid="wizard-suggest-scope-toggle"
          onClick={() => setShowSuggest((prev) => !prev)}
        >
          {showSuggest ? "Hide scope suggestion" : "Missing a scope? Suggest one"}
        </button>
        {showSuggest && (
          <div className="scope-suggest-form" data-testid="wizard-suggest-scope-form">
            <p className="hint">
              Propose a new scope for the schema. You&rsquo;ll open a pre-filled GitHub issue in
              this project.
            </p>
            <label className="field-label" htmlFor="suggest-key">
              Proposed key
            </label>
            <input
              id="suggest-key"
              type="text"
              data-testid="wizard-suggest-key"
              placeholder="e.g. translation.assisted"
              value={suggestKey}
              onChange={(e) => setSuggestKey(e.target.value)}
            />
            <label className="field-label" htmlFor="suggest-desc">
              Description
            </label>
            <textarea
              id="suggest-desc"
              data-testid="wizard-suggest-desc"
              rows={3}
              placeholder="What should this scope mean?"
              value={suggestDesc}
              onChange={(e) => setSuggestDesc(e.target.value)}
            />
            <label className="field-label" htmlFor="suggest-example">
              Example
            </label>
            <input
              id="suggest-example"
              type="text"
              data-testid="wizard-suggest-example"
              placeholder="e.g. asked AI to translate a quote before including it"
              value={suggestExample}
              onChange={(e) => setSuggestExample(e.target.value)}
            />
            <div className="actions end">
              <a
                href={buildScopeSuggestionUrl({
                  key: suggestKey,
                  desc: suggestDesc,
                  example: suggestExample,
                })}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="wizard-suggest-github"
              >
                <button type="button" className="primary">
                  Open GitHub issue
                </button>
              </a>
            </div>
          </div>
        )}
      </div>
      <div className="actions end">
        <button
          className="primary"
          data-testid="wizard-continue"
          disabled={!none && selectedCount === 0}
          onClick={onContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function Step2({ target, setTarget, onBack, onContinue }) {
  const [touched, setTouched] = useState(false);
  const trimmedTarget = target.trim();
  const urlValid = isValidHttpUrl(trimmedTarget);
  const showUrlError = touched && trimmedTarget.length > 0 && !urlValid;

  return (
    <div data-testid="wizard-step-2">
      <div className="step-title">Link to the article</div>
      <p className="hint">Where should readers land after they continue?</p>
      <input
        type="url"
        data-testid="wizard-article-url"
        placeholder="https://yourblog.com/your-article"
        value={target}
        aria-invalid={showUrlError}
        onChange={(e) => setTarget(e.target.value)}
        onBlur={() => setTouched(true)}
      />
      {showUrlError && (
        <p className="field-error" data-testid="wizard-article-url-error">
          Enter a valid web URL starting with http:// or https://
        </p>
      )}
      <div className="actions">
        <button className="link-back" onClick={onBack}>
          &larr; Back
        </button>
        <button
          className="primary"
          data-testid="wizard-review"
          disabled={!urlValid}
          onClick={onContinue}
        >
          Review
        </button>
      </div>
    </div>
  );
}

function Step3({ none, selectedKeys, target, onBack, onGenerate }) {
  const items = none ? ["none"] : selectedKeys;
  return (
    <div data-testid="wizard-step-3">
      <div className="step-title">Confirm before generating</div>
      <ul className="review-list">
        {items.map((k) => (
          <li key={k}>{k}</li>
        ))}
      </ul>
      <div className="target-line">Article: {target}</div>
      <div className="disclaimer">
        This will route readers through permitting your AI usage first before reaching your article.
        It is self-attested only, and no verification is performed.
      </div>
      <div className="actions">
        <button className="link-back" onClick={onBack}>
          &larr; Back
        </button>
        <button className="primary" data-testid="wizard-generate" onClick={onGenerate}>
          Generate link
        </button>
      </div>
    </div>
  );
}

function Step4({ generatedRouteUrl, generatedViewUrl, encodedPayload, onCopy, onStartOver }) {
  const [routeCopied, setRouteCopied] = useState(false);
  const [viewCopied, setViewCopied] = useState(false);
  const [shareRouteUrl, setShareRouteUrl] = useState("");
  const [shareViewUrl, setShareViewUrl] = useState("");
  const [routeShortening, setRouteShortening] = useState(true);
  const [viewShortening, setViewShortening] = useState(true);
  const [routeShortenFailed, setRouteShortenFailed] = useState(false);
  const [viewShortenFailed, setViewShortenFailed] = useState(false);
  const [showFullRouteLink, setShowFullRouteLink] = useState(false);
  const [badgeSvg, setBadgeSvg] = useState("");
  const [badgeItems, setBadgeItems] = useState([]);

  const displayRouteUrl = shareRouteUrl || generatedRouteUrl;
  const displayViewUrl = shareViewUrl || generatedViewUrl;
  const previewRouteUrl = shareRouteUrl || generatedRouteUrl;

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([30, 20, 30]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    function buildBadge() {
      try {
        const payload = b64decode(encodedPayload);
        if (!cancelled) {
          setBadgeItems(getDisclosureItems(payload));
          setBadgeSvg(buildDisclosureBadgeSvg(payload));
        }
      } catch {
        if (!cancelled) {
          setBadgeItems([]);
          setBadgeSvg("");
        }
      }
    }

    if (encodedPayload) buildBadge();
    return () => {
      cancelled = true;
    };
  }, [encodedPayload]);

  useEffect(() => {
    let cancelled = false;
    setShareRouteUrl("");
    setRouteShortening(true);
    setRouteShortenFailed(false);
    setShowFullRouteLink(false);

    shortenUrl(generatedRouteUrl)
      .then((short) => {
        if (!cancelled) {
          setShareRouteUrl(short);
          setRouteShortening(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRouteShortenFailed(true);
          setRouteShortening(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [generatedRouteUrl]);

  useEffect(() => {
    let cancelled = false;
    setShareViewUrl("");
    setViewShortening(true);
    setViewShortenFailed(false);

    shortenUrl(generatedViewUrl)
      .then((short) => {
        if (!cancelled) {
          setShareViewUrl(short);
          setViewShortening(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setViewShortenFailed(true);
          setViewShortening(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [generatedViewUrl]);

  function handleCopy(url, setCopied) {
    onCopy(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div data-testid="wizard-step-4">
      <input
        type="hidden"
        data-testid="wizard-full-route-url"
        value={generatedRouteUrl}
        readOnly
        tabIndex={-1}
        aria-hidden="true"
      />
      <input
        type="hidden"
        data-testid="wizard-full-view-url"
        value={generatedViewUrl}
        readOnly
        tabIndex={-1}
        aria-hidden="true"
      />
      <div className="step-title center-text link-ready-title">
        <span className="success-check" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <circle className="success-check-circle" cx="12" cy="12" r="10" />
            <path className="success-check-mark" d="M7.5 12.5l3 3 6-7" />
          </svg>
        </span>
        Link ready
      </div>

      <section className="output-section">
        <h2 className="output-heading">Share link</h2>
        <p className="hint">
          Use this in your bio, newsletter, or social posts. Readers see your disclosure before
          reaching the article.
        </p>
        <label className="field-label">{routeShortenFailed ? "Route link" : "Short link"}</label>
        <div className="link-box">
          <input
            type="text"
            readOnly
            value={routeShortening ? "Creating short link…" : displayRouteUrl}
            data-testid="wizard-consent-link"
          />
          <button
            disabled={routeShortening}
            onClick={() => handleCopy(displayRouteUrl, setRouteCopied)}
          >
            {routeCopied ? "Copied" : "Copy"}
          </button>
        </div>
        {!routeShortening && !routeShortenFailed && (
          <p className="hint">Shortened automatically for sharing.</p>
        )}
        {routeShortenFailed && (
          <p className="hint">Could not create a short link right now. Copy the full link below.</p>
        )}
        <button
          type="button"
          className="link-back link-toggle"
          data-testid="wizard-full-link-toggle"
          onClick={() => setShowFullRouteLink((prev) => !prev)}
        >
          {showFullRouteLink ? "Hide full link" : "Show full link"}
        </button>
        {showFullRouteLink && (
          <div className="full-link-box">
            <input
              type="text"
              readOnly
              value={generatedRouteUrl}
              data-testid="wizard-full-consent-link"
            />
          </div>
        )}
      </section>

      <section className="output-section">
        <h2 className="output-heading">Add to your article</h2>
        <p className="hint">
          For readers who land on the article directly. Place the badge and/or disclosure link on
          the page itself.
        </p>

        <label className="field-label">Disclosure link</label>
        <p className="hint field-hint">
          For a byline or footer, e.g. &ldquo;How AI was used in this piece.&rdquo;
        </p>
        <div className="link-box">
          <input
            type="text"
            readOnly
            value={viewShortening ? "Creating short link…" : displayViewUrl}
            data-testid="wizard-disclosure-link"
          />
          <button
            disabled={viewShortening}
            onClick={() => handleCopy(displayViewUrl, setViewCopied)}
            data-testid="wizard-disclosure-copy"
          >
            {viewCopied ? "Copied" : "Copy"}
          </button>
        </div>
        {viewShortenFailed && (
          <p className="hint">Shortening unavailable. Copy uses the full disclosure link.</p>
        )}

        <label className="field-label badge-label">Badge</label>
        <p className="hint field-hint">
          Download the SVG and upload it to your post. On Substack, add the image then link it to
          your disclosure URL above.
        </p>
        {badgeItems.length > 0 && (
          <DisclosureBadge
            className="badge-preview"
            items={badgeItems}
            testId="wizard-badge-preview"
          />
        )}
        <div className="badge-actions">
          <button
            type="button"
            disabled={!badgeSvg}
            data-testid="wizard-badge-download"
            onClick={() => downloadBadgeSvg(badgeSvg)}
          >
            Download SVG
          </button>
        </div>
      </section>

      <div className="actions">
        <button className="link-back" onClick={onStartOver}>
          Start over
        </button>
        <a href={previewRouteUrl} target="_blank" rel="noopener noreferrer">
          <button className="primary" disabled={routeShortening}>
            Preview as reader
          </button>
        </a>
      </div>
    </div>
  );
}
