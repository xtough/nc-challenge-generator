## Why

NightCafe's "Build-a-Prompt" challenges are a engaging way to explore AI art generation, but creating varied, thematically-coherent challenges manually is time-consuming and repetitive. A CLI generator can produce unique challenges on-demand with intelligent category matching, eliminating manual repetition while maintaining creative constraints.

## What Changes

- New CLI tool (`nightcafe-gen`) to generate NightCafe Build-a-Prompt challenges
- Data-driven category system with themed category matching (subject/character, setting/environment, mood/atmosphere, medium/technique, style, artist)
- Embedded dataset of ~900 artists and styles from Stable Diffusion cheat sheet
- Challenge library to track generated challenges and prevent duplicates
- Multi-format output: pretty-print (terminal), markdown (share), JSON (programmatic)
- Resync capability to update artist data from online cheat sheet
- Configurable items-per-category (default 5) with mandatory keyword support

## Capabilities

### New Capabilities
- `challenge-generation`: Generate random or themed challenges with matching categories
- `artist-data-management`: Maintain and resync ~900 artists and styles from cheat sheet
- `challenge-library-management`: Track generated challenges to avoid repetition
- `output-formatting`: Format challenges as pretty-print, markdown, or JSON
- `theme-matching`: Intelligently select category items that align with challenge theme

## Impact

- **Code**: New Node.js/TypeScript CLI tool in `/tools/nightcafe-challenge-generator`
- **Data**: New JSON files for artists, themes, challenge library
- **Dependencies**: Minimal (axios for optional resync, commander for CLI)
- **Integration**: Standalone tool, no coupling to existing codebase
- **User workflow**: Manual copy-paste to NightCafe (no automation needed)
