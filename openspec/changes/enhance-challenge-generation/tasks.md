## 1. Data Refactoring

- [x] 1.1 Refactor data/themes.json: Replace all style descriptors with artistic movements (Renaissance, Romanticism, Art Deco, Cubism, Impressionism, Surrealism, Grunge, Cyberpunk, Steampunk, Art Nouveau, Brutalism, Expressionism, etc.)
- [x] 1.2 Verify each theme has 5-8 artistic style options in the style pool
- [x] 1.3 Verify artists.json includes diverse styles covering all theme styles (validate cross-reference)

## 2. Type Definitions

- [x] 2.1 Review Challenge interface in src/types.ts and confirm it supports 6 categories (artist is already supported as dynamic category)
- [ ] 2.2 Document that artist category is now required in every challenge

## 3. Artist Selection Logic

- [x] 3.1 Implement artist selection algorithm in ChallengeGenerator: filter artists by theme-compatible styles
- [x] 3.2 Add fallback logic if no theme-compatible artists found (use random artist from full library)
- [x] 3.3 Update ChallengeGenerator.generateRandomChallenge() to select and include artist before returning challenge
- [x] 3.4 Update ChallengeGenerator.generateChallengeForTheme() to include artist in generation

## 4. Category Handling

- [x] 4.1 Ensure ThemeMatcher properly handles artist category (should be treated like other categories)
- [ ] 4.2 Verify artist is included in challenge.categories object alongside subject, setting, mood, medium, style

## 5. Output Formatting

- [x] 5.1 Update PrettyPrintFormatter to display artist category
- [x] 5.2 Update MarkdownFormatter to output artist in NightCafe-compatible format (### ARTIST with numbered list)
- [x] 5.3 Update JsonFormatter to include artist in JSON output (already generic, may need no changes)
- [x] 5.4 Test all formatters with artist category present
- [x] 5.5 Verify markdown output matches exact NightCafe format (compare against reference challenge)

## 6. Deduplication & Signatures

- [x] 6.1 Verify challenge signatures include artist (should be automatic if artist is in categories)
- [x] 6.2 Test isDuplicate() with challenges that differ only in artist (should NOT be duplicates)
- [x] 6.3 Update dedup documentation/comments to reflect artist inclusion in signature

## 7. CLI Updates

- [x] 7.1 Ensure --items flag behavior is correct with artist (artist always 1, other categories use specified count)
- [x] 7.2 Test --artists override flag (should be ignored, artist always 1)
- [x] 7.3 Verify help text mentions artist category inclusion

## 8. Testing

- [x] 8.1 Add unit tests for artist selection (theme compatibility, fallback logic)
- [x] 8.2 Add unit tests for ChallengeGenerator with artist (verify artist is present and theme-compatible)
- [x] 8.3 Add unit tests for all formatters with artist category
- [x] 8.4 Add integration tests: generate challenge for each theme, verify artist is present
- [x] 8.5 Add tests for edge cases (no artists for theme, empty themes.json style pool)
- [x] 8.6 Update existing tests that validate category count/presence to account for 6th category

## 9. Documentation

- [x] 9.1 Update README.md: Document artist category and artistic style values
- [x] 9.2 Add art movement reference to README (link to guide or list of movements used)
- [x] 9.3 Update example challenge output in README to show artist category
- [x] 9.4 Document NightCafe format compliance in README

## 10. Integration & Validation

- [x] 10.1 Build project: `npm run build` (should have no TypeScript errors)
- [x] 10.2 Run all tests: `npm test` (all should pass, verify new tests included)
- [x] 10.3 Manual test: generate 5 random challenges, verify each has artist and correct style values
- [x] 10.4 Manual test: generate challenges for each theme, verify artist/style match theme
- [x] 10.5 Manual test: markdown output, copy-paste into NightCafe interface to verify format
- [x] 10.6 Verify no regressions in existing challenges (themes still work, dedup still works)

## 11. Finalization

- [x] 11.1 Update CHANGELOG.md with changes (artist category, style refactoring, output format alignment)
- [ ] 11.2 Commit all changes with descriptive message
- [ ] 11.3 Push to origin and verify CI/CD passes
