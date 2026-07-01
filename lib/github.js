const DEFAULT_REPO = "michaelmang/permit-ai";

export function getGitHubRepo() {
  return process.env.NEXT_PUBLIC_GITHUB_REPO || DEFAULT_REPO;
}

export function buildScopeSuggestionUrl({ key = "", desc = "", example = "" }) {
  const repo = getGitHubRepo();
  const title = key.trim() ? `Scope suggestion: ${key.trim()}` : "Scope suggestion";
  const body = [
    "## Proposed scope key",
    key.trim() || "(describe the key, e.g. translation.assisted)",
    "",
    "## Description",
    desc.trim() || "(what does this scope mean?)",
    "",
    "## Example",
    example.trim() || "(e.g., asked AI to translate a quote before including it)",
    "",
    "---",
    "Submitted from the Permit AI wizard.",
  ].join("\n");

  const params = new URLSearchParams({
    template: "scope-suggestion.md",
    title,
    body,
  });

  return `https://github.com/${repo}/issues/new?${params.toString()}`;
}
