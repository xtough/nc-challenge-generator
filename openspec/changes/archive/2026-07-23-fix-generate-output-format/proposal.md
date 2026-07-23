## Why

Two bugs in the `generate` command produce output that doesn't match the NightCafe challenge format:
1. The ARTIST category always outputs exactly 1 artist, but challenges need 5 options (same count as all other categories) so participants can choose.
2. Each category is rendered as a numbered list under a `### HEADER` — the actual NightCafe format is a flat bullet list where each bullet is a category's items comma-separated on one line, with no category name shown.

## What Changes

- **ARTIST count**: Remove the hardcoded `artist = 1` special case in `ChallengeGenerator.ts`; artist category uses the same item count as all other categories (default 5).
- **Output format**: Replace the current numbered-list-per-category output with a flat bullet list matching `data/challenge-example.md`:
  - First bullet: `- {mandatory_keyword} (required)`
  - One bullet per category: `- Item1, Item2, Item3, Item4, Item5`
  - No category names or headers in the body
  - NightCafe challenge rules header at the top
  - One example line at the bottom showing a sample combined prompt

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `challenge-generation`: artist count changes from 1 to 5 (same as all other categories)
- `output-formatting`: default output format changes to flat comma-separated bullet list matching NightCafe challenge convention

## Impact

- `src/ChallengeGenerator.ts`: remove artist-specific count override
- `src/OutputFormatter.ts`: rewrite `PrettyPrintFormatter` and `MarkdownFormatter` to produce flat bullet list output
- Existing tests for both formatter and generator artist count need updating
