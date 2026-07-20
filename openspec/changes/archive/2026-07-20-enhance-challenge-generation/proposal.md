## Why

Generated challenges are currently incomplete compared to actual NightCafe Build-a-Prompt challenges. They lack artist suggestions and use generic style descriptors (e.g., "dramatic", "historical") rather than authentic artistic styles and epochs. This makes generated challenges less useful for copy-paste into NightCafe and less educational about art movements. Including real artists and proper artistic styles aligns the tool with actual NightCafe challenge conventions.

## What Changes

- Add required artist category to challenges: each challenge now includes a random selection from the artist library
- Rename and refocus "style" category: change from generic descriptors to authentic artistic movements/epochs (e.g., "Romanticism", "Renaissance", "Grunge", "Art Deco")
- Enhance category pools in theme definitions to use curated artistic styles instead of mood-like descriptors
- Update output formatters to properly display artists with other categories
- Update challenge signature/dedup logic to include artists for more reliable duplicate detection

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `challenge-generation`: Add artist category requirement; restructure style category to use artistic movements/epochs; ensure output format matches NightCafe challenge conventions (verbatim markdown for easy copy-paste)
- `output-formatting`: Update all output formatters (pretty-print, markdown, JSON) to display the new artist category alongside existing categories

## Impact

- `src/types.ts`: Challenge interface may need artist field adjustment (currently expects fixed categories)
- `src/ChallengeGenerator.ts`: Add artist selection logic; rework style selection to use artistic movements instead of generic descriptors
- `src/OutputFormatter.ts`: All formatters updated to display artists
- `data/themes.json`: Refactor all theme style pools to use real art movements; potentially add new theme-artist affinity mappings
- Output markdown format updated to match NightCafe challenge text blocks (numbered lists with category headers)
