export const SCOPES = [
  {
    key: "research.assisted",
    borderColor: "#2563eb",
    desc: "AI was used to gather, summarize, or surface source material or background research.",
    example: "e.g., asked AI to summarize three papers before writing this section.",
  },
  {
    key: "outline.assisted",
    borderColor: "#7c3aed",
    desc: "AI helped structure, sequence, or outline the piece.",
    example: "e.g., asked AI to suggest a section order.",
  },
  {
    key: "draft.generated",
    borderColor: "#ea580c",
    desc: "AI produced substantial draft prose that was retained in the final piece.",
    example: "e.g., AI wrote a first-pass paragraph that survived largely intact.",
  },
  {
    key: "edit.grammar",
    borderColor: "#0d9488",
    desc: "AI was used for grammar, spelling, or line-level copyediting only.",
    example: "e.g., ran the final draft through AI for typos.",
  },
  {
    key: "edit.substantive",
    borderColor: "#d97706",
    desc: "AI suggested substantive revisions to argument, structure, or content that the author then applied.",
    example: "e.g., asked AI to critique the argument and revised accordingly.",
  },
  {
    key: "feedback.reviewed",
    borderColor: "#4f46e5",
    desc: "AI was used to critique or review a human-written draft, without generating replacement text.",
    example: "e.g., asked whether the argument holds up, without asking for a rewrite.",
  },
  {
    key: "image.generated",
    borderColor: "#db2777",
    desc: "AI was used to generate accompanying visuals.",
    example: "e.g., the header image was AI-generated.",
  },
];

export const DEFAULT_SCOPE_BORDER_COLOR = "#6b7280";

export function getScopeBorderColor(key) {
  const scope = SCOPES.find((item) => item.key === key);
  return scope?.borderColor ?? DEFAULT_SCOPE_BORDER_COLOR;
}
