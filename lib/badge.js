function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function scopeSummary(payload) {
  if (payload.none === true) return "No AI used";
  const scopes = (payload.scopes || []).filter((k) => k !== "none");
  if (scopes.length === 0) return "AI disclosed";
  if (scopes.length <= 2) return scopes.join(", ");
  return `${scopes.length} scopes disclosed`;
}

export function buildDisclosureBadgeSvg(payload, rid) {
  const summary = escapeXml(scopeSummary(payload));
  const receiptId = escapeXml(rid ? `#${rid}` : "");
  const width = 320;
  const height = 64;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="AI disclosure badge">
  <rect width="${width}" height="${height}" rx="8" fill="#ffffff" stroke="#e5e7eb" stroke-width="1"/>
  <text x="16" y="26" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" fill="#6b7280" letter-spacing="0.04em">AI DISCLOSURE</text>
  <text x="16" y="48" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="14" font-weight="500" fill="#111111">${summary}</text>
  <text x="304" y="48" text-anchor="end" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="12" font-weight="500" fill="#6b7280">${receiptId}</text>
</svg>`;
}

export function downloadBadgeSvg(svg, filename = "ai-disclosure-badge.svg") {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
