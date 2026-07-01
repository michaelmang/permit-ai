export const SCOPES = [
  {
    key: "research.assisted",
    desc: "AI was used to gather, summarize, or surface source material or background research.",
    example: "e.g., asked AI to summarize three papers before writing this section.",
  },
  {
    key: "outline.assisted",
    desc: "AI helped structure, sequence, or outline the piece.",
    example: "e.g., asked AI to suggest a section order.",
  },
  {
    key: "draft.generated",
    desc: "AI produced substantial draft prose that was retained in the final piece.",
    example: "e.g., AI wrote a first-pass paragraph that survived largely intact.",
  },
  {
    key: "edit.grammar",
    desc: "AI was used for grammar, spelling, or line-level copyediting only.",
    example: "e.g., ran the final draft through AI for typos.",
  },
  {
    key: "edit.substantive",
    desc: "AI suggested substantive revisions to argument, structure, or content that the author then applied.",
    example: "e.g., asked AI to critique the argument and revised accordingly.",
  },
  {
    key: "feedback.reviewed",
    desc: "AI was used to critique or review a human-written draft, without generating replacement text.",
    example: "e.g., asked whether the argument holds up, without asking for a rewrite.",
  },
  {
    key: "image.generated",
    desc: "AI was used to generate accompanying visuals.",
    example: "e.g., the header image was AI-generated.",
  },
];
