import { DISCLOSURE_LABEL, getDisclosureItems } from "./disclosure";

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapLines(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }

  if (line) lines.push(line);
  return lines;
}

function textAttrs(node) {
  const attrs = [
    `x="${node.x}"`,
    `y="${node.y}"`,
    `font-family="Inter, system-ui, -apple-system, sans-serif"`,
    `font-size="${node.size}"`,
    `fill="${node.fill}"`,
  ];

  if (node.weight) attrs.push(`font-weight="${node.weight}"`);
  if (node.anchor) attrs.push(`text-anchor="${node.anchor}"`);
  if (node.letterSpacing) attrs.push(`letter-spacing="${node.letterSpacing}"`);

  return attrs.join(" ");
}

export function buildDisclosureBadgeSvg(payload, rid) {
  const items = getDisclosureItems(payload);
  const width = 480;
  const pad = 16;
  const maxChars = 58;
  const nodes = [];
  let y = pad + 12;

  nodes.push({
    x: pad,
    y,
    text: escapeXml(DISCLOSURE_LABEL),
    size: 11,
    weight: 600,
    fill: "#6b7280",
    letterSpacing: "0.04em",
  });

  if (rid) {
    nodes.push({
      x: width - pad,
      y,
      text: escapeXml(`#${rid}`),
      size: 12,
      weight: 500,
      fill: "#6b7280",
      anchor: "end",
    });
  }

  y += 24;

  items.forEach((item, index) => {
    if (index > 0) y += 4;

    nodes.push({
      x: pad,
      y,
      text: escapeXml(item.key),
      size: 14,
      weight: 500,
      fill: "#111111",
    });
    y += 18;

    wrapLines(item.desc, maxChars).forEach((line) => {
      nodes.push({
        x: pad,
        y,
        text: escapeXml(line),
        size: 13,
        fill: "#6b7280",
      });
      y += 16;
    });
  });

  const height = y + pad;
  const textMarkup = nodes
    .map((node) => `<text ${textAttrs(node)}>${node.text}</text>`)
    .join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(DISCLOSURE_LABEL)} badge">
  <rect width="${width}" height="${height}" rx="8" fill="#ffffff" stroke="#e5e7eb" stroke-width="1"></rect>
  ${textMarkup}
</svg>`;
}

export function badgeSvgToDataUri(svg) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
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
