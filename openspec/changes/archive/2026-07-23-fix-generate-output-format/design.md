## Context

The `ChallengeGenerator` hardcodes artist count to 1 (line 47 in `src/ChallengeGenerator.ts`). The `OutputFormatter` renders categories as numbered sub-lists under `### HEADER` markdown headers. The `data/challenge-example.md` shows the correct format: a flat bullet list, one bullet per category with items comma-separated, no headers, mandatory keyword on line 1, example prompt at the bottom.

## Goals / Non-Goals

**Goals:**
- Artist category uses the same `itemsPerCategory` count as all other categories (default 5)
- All formatters produce flat bullet list output matching `challenge-example.md`
- The example line at the bottom is generated from one item per category

**Non-Goals:**
- Changing the NightCafe challenge rules header text (that's content, not formatting)
- Adding new output formats
- Changing JSON formatter (JSON is for programmatic use, not human-readable)

## Decisions

**Remove artist special-case in ChallengeGenerator, not in CLI**
The count lives at `ChallengeGenerator.ts:47`. Removing the `if (categoryName === 'artist')` branch and letting it fall through to the standard `itemsPerCategory` logic is the minimal, correct fix.

**Single flat bullet list format for both PrettyPrint and Markdown**
Both formatters should produce the same NightCafe-compatible flat format since it's the canonical output. The distinction between "pretty-print" (terminal) and "markdown" (shareable) becomes cosmetic only — both follow the `challenge-example.md` structure.

**Example line uses first item from each category**
Simple and deterministic — matches the style of the example in `challenge-example.md`.

## Risks / Trade-offs

- [Existing tests assert artist count = 1] → Tests must be updated to expect count = 5
- [Existing tests assert numbered list format] → Tests must be updated to expect flat bullet format
- [JSON formatter unchanged] → No risk; JSON consumers see the raw data structure regardless

## Migration Plan

1. Fix `ChallengeGenerator.ts`: remove `if (categoryName === 'artist')` special case
2. Rewrite `PrettyPrintFormatter.format()` and `MarkdownFormatter.format()` to produce flat bullet list
3. Update affected tests
4. Verify output manually against `data/challenge-example.md`
