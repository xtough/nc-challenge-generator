## 1. Fix Artist Count

- [x] 1.1 In `src/ChallengeGenerator.ts`, remove the `if (categoryName === 'artist')` branch (lines 47–53) so the artist category uses `itemsPerCategory` like all other categories
- [x] 1.2 Update `selectArtistForTheme` to return `count` artists: rename it `selectArtistsForTheme(theme, count)`, change the return type to `Artist[]`, and return a random sample of `count` artists from the compatible pool
- [x] 1.3 Update the backward-compat block (lines 57–60) to also use `selectArtistsForTheme(theme, itemsPerCategory)`

## 2. Fix Output Format

- [x] 2.1 Rewrite `PrettyPrintFormatter.format()` in `src/OutputFormatter.ts` to produce a flat bullet list
- [x] 2.2 Rewrite `MarkdownFormatter.format()` to produce the same flat bullet list (same structure, no `###` headers or numbered lists)

## 3. Update Tests

- [x] 3.1 In `src/__tests__/generator.test.ts`, find tests that assert artist count = 1 and update them to assert count = 5 (or `itemsPerCategory`)
- [x] 3.2 In `src/__tests__/cli.test.ts` or formatter tests, update any assertions on numbered list or `### HEADER` format to match the new flat bullet format

## 4. Verify and Commit

- [x] 4.1 Run `npm test` and confirm all tests pass
- [x] 4.2 Run `node dist/cli.js generate` and visually verify output matches `data/challenge-example.md`
- [x] 4.3 Commit: `fix: artist category outputs 5 items; output uses flat bullet list format`
