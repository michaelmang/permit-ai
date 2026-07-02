import { SCOPES } from "./scopes";

export const BADGE_LABEL = "Here's how I used AI";
export const BADGE_LABEL_NONE = "No AI was used";

export function getBadgeLabel(items) {
  if (items.some((item) => item.key === "none")) return BADGE_LABEL_NONE;
  return BADGE_LABEL;
}

const NONE_ITEM = {
  key: "none",
  borderColor: "#059669",
  desc: "No AI involvement at any stage.",
};

export function getDisclosureItems(payload) {
  if (payload.none === true) return [NONE_ITEM];
  return (payload.scopes || [])
    .filter((key) => key !== "none")
    .map((key) => SCOPES.find((scope) => scope.key === key))
    .filter(Boolean);
}

export function getDisclosureIntro(payload) {
  if (payload.none === true) {
    return "To be transparent, no AI was used in this article.";
  }
  return "To be transparent, here's how I used AI in this article.";
}
