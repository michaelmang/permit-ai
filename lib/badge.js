import { getBadgeLabel, getDisclosureItems } from "./disclosure";
import { getBadgeBorderStyle } from "./badgeBorder";
import {
  BADGE_PAD,
  BADGE_WIDTH,
  DESC,
  HEADER_MARGIN_BOTTOM,
  ITEM,
  KEY,
  LABEL,
  lineBaseline,
  wrapText,
} from "./badgeLayout";

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

function buildDividerMarkup(dividers) {
  return dividers
    .map(
      (divider) =>
        `<line x1="${divider.x1}" y1="${divider.y}" x2="${divider.x2}" y2="${divider.y}" stroke="${ITEM.borderColor}" stroke-width="${ITEM.borderWidth}"></line>`,
    )
    .join("\n  ");
}

export function buildDisclosureBadgeSvg(payload) {
  const items = getDisclosureItems(payload);
  const border = getBadgeBorderStyle(items);
  const label = getBadgeLabel(items);
  const width = BADGE_WIDTH;
  const pad = BADGE_PAD;
  const nodes = [];
  const dividers = [];
  let cursor = pad;

  nodes.push({
    x: pad,
    y: lineBaseline(cursor, LABEL.size),
    text: escapeXml(label),
    size: LABEL.size,
    weight: LABEL.weight,
    fill: COLORS.muted,
    letterSpacing: LABEL.letterSpacing,
  });

  cursor += LABEL.lineHeight + HEADER_MARGIN_BOTTOM;

  items.forEach((item, index) => {
    if (index > 0) {
      dividers.push({
        x1: pad,
        x2: width - pad,
        y: cursor + ITEM.borderWidth / 2,
      });
      cursor += ITEM.borderWidth + ITEM.paddingY;
    }

    nodes.push({
      x: pad,
      y: lineBaseline(cursor, KEY.size),
      text: escapeXml(item.key),
      size: KEY.size,
      weight: KEY.weight,
      fill: COLORS.text,
    });
    cursor += KEY.lineHeight + DESC.marginTop;

    wrapText(item.desc, DESC.size).forEach((line) => {
      nodes.push({
        x: pad,
        y: lineBaseline(cursor, DESC.size),
        text: escapeXml(line),
        size: DESC.size,
        fill: COLORS.muted,
      });
      cursor += DESC.lineHeight;
    });

    cursor += ITEM.paddingY;
  });

  const height = cursor + pad;
  const textMarkup = nodes
    .map((node) => `<text ${textAttrs(node)}>${node.text}</text>`)
    .join("\n  ");
  const dividerMarkup = buildDividerMarkup(dividers);
  const borderMarkup = buildBorderMarkup(width, height, border);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(label)} badge">
  ${borderMarkup}
  ${dividerMarkup ? `${dividerMarkup}\n  ` : ""}${textMarkup}
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
