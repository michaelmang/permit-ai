// Layout tokens mirrored from .disclosure-badge rules in app/globals.css.

export const BADGE_WIDTH = 480;
export const BADGE_PAD = 16;
export const BADGE_CONTENT_WIDTH = BADGE_WIDTH - BADGE_PAD * 2;

export const LABEL = {
  size: 11,
  weight: 600,
  lineHeight: 17.6, // 11px * body line-height 1.6
  letterSpacing: "0.04em",
};

export const HEADER_MARGIN_BOTTOM = 12;

export const KEY = {
  size: 14,
  weight: 500,
  lineHeight: 22.4, // 14px * body line-height 1.6
};

export const DESC = {
  size: 13,
  lineHeight: 18.85, // 13px * line-height 1.45
  marginTop: 4,
};

export const ITEM = {
  paddingY: 10,
  borderWidth: 1,
  borderColor: "#e5e7eb",
};

// Approximate ascender ratio for Inter when positioning SVG text baselines.
export const BASELINE_FACTOR = 0.78;

export function lineBaseline(lineTop, fontSize) {
  return lineTop + fontSize * BASELINE_FACTOR;
}

export function wrapText(
  text,
  fontSize,
  contentWidth = BADGE_CONTENT_WIDTH,
  avgCharWidthRatio = 0.53,
) {
  const maxChars = Math.max(1, Math.floor(contentWidth / (fontSize * avgCharWidthRatio)));
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
