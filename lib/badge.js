import { getBadgeLabel, getDisclosureItems } from "./disclosure";
import { getBadgeBorderStyle } from "./badgeBorder";

const COLORS = {
  white: "rgb(255, 255, 255)",
  muted: "rgb(107, 114, 128)",
  text: "rgb(17, 17, 17)",
};

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

function buildBorderMarkup(width, height, border) {
  const inset = 1;
  const fillRect = `<rect x="${inset}" y="${inset}" width="${width - inset * 2}" height="${height - inset * 2}" rx="7" fill="${COLORS.white}"></rect>`;
  const strokeRect = `<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="8" fill="none" stroke-width="2"`;

  if (border.type === "gradient") {
    const stops = border.svgGradientStops
      .map((stop) => `<stop offset="${stop.offset}" stop-color="${stop.color}"></stop>`)
      .join("\n      ");

    return `<defs>
    <linearGradient id="badge-border" x1="0%" y1="0%" x2="100%" y2="100%">
      ${stops}
    </linearGradient>
  </defs>
  ${fillRect}
  ${strokeRect} stroke="url(#badge-border)"></rect>`;
  }

  return `${fillRect}
  ${strokeRect} stroke="${border.color}"></rect>`;
}

export function buildDisclosureBadgeSvg(payload) {
  const items = getDisclosureItems(payload);
  const border = getBadgeBorderStyle(items);
  const label = getBadgeLabel(items);
  const width = 480;
  const pad = 16;
  const maxChars = 58;
  const nodes = [];
  let y = pad + 12;

  nodes.push({
    x: pad,
    y,
    text: escapeXml(label),
    size: 11,
    weight: 600,
    fill: COLORS.muted,
    letterSpacing: "0.04em",
  });

  y += 24;

  items.forEach((item, index) => {
    if (index > 0) y += 4;

    nodes.push({
      x: pad,
      y,
      text: escapeXml(item.key),
      size: 14,
      weight: 500,
      fill: COLORS.text,
    });
    y += 18;

    wrapLines(item.desc, maxChars).forEach((line) => {
      nodes.push({
        x: pad,
        y,
        text: escapeXml(line),
        size: 13,
        fill: COLORS.muted,
      });
      y += 16;
    });
  });

  const height = y + pad;
  const textMarkup = nodes
    .map((node) => `<text ${textAttrs(node)}>${node.text}</text>`)
    .join("\n  ");
  const borderMarkup = buildBorderMarkup(width, height, border);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(label)} badge">
  ${borderMarkup}
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
