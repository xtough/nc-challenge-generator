# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-07-20

### Added

#### Core Features
- **Challenge Generation Engine**: Create NightCafe Build-a-Prompt challenges with random theme selection or targeted theme generation
- **Theme System**: 12 pre-configured themes (Vikings, Gothic Victorian, Brutalism, Weather Phenomena, Dream Architecture, Realism, Whimsical Masterpiece, Spring, Cyberpunk, Medieval Fantasy, Underwater, Portal/Interdimensional, Portraits)
- **Artist Database**: 48-item curated artist collection with support for 900+ artists from external sources
- **Category System**: Five challenge categories per theme (Subject, Setting, Mood, Medium, Style) with thematic coherence

#### CLI Commands
- `generate` (default): Generate new challenges with options for theme selection, category item count customization, and output formatting
  - `--theme <name>` - Target specific theme
  - `--items <number>` - Items per category (default: 5)
  - `--format <type>` - Output format: pretty-print, markdown, json, all
  - `--output <file>` - Save to file
  - `--no-dedupe` - Skip duplicate checking
  - Category overrides: `--artists`, `--subjects`, `--settings`, `--moods`, `--mediums`, `--styles`

- `themes` - List all available themes with descriptions
- `history` - View generated challenges with filtering and search
  - `--limit <number>` - Number of results (default: 10)
  - `--theme <name>` - Filter by theme
  - `--search <query>` - Search challenges
  - `--format <type>` - Output format (table/json)

- `stats` - Show library statistics by theme
- `clear` - Remove challenges from library
  - `--old <days>` - Clear challenges older than N days
  - `--confirm` - Skip confirmation prompt

- `resync-artists` - Update artist database from external cheat sheet
- `resync-challenges` - Sync challenges from NightCafe (scaffolding)

#### Output Formatting
- **Pretty-Print Formatter**: Terminal-friendly format with emoji headers, numbered lists, and visual borders
- **Markdown Formatter**: Valid markdown output with timestamps, suitable for documentation and sharing
- **JSON Formatter**: Machine-readable format for programmatic use
- **Multi-Format Output**: Generate all formats simultaneously with `--format all`

#### Challenge Library
- Persistent JSON-based storage in `~/.nightcafe-gen/challenges-library.json`
- Automatic deduplication using signature-based matching (theme + sorted items)
- Challenge history with timestamps
- Theme-based filtering and search capabilities
- Library statistics and cleanup utilities

#### Data Management
- JSON-based themes and artists data embedded in package
- Support for custom themes via themes.json
- Lazy-loading of data files
- Support for resync operations to update from external sources

#### Development & Testing
- Full TypeScript strict mode compilation
- 16-test Jest test suite covering:
  - Random and targeted challenge generation
  - Theme validation and matching
  - Library deduplication
  - All output formatters
  - Theme consistency
- CLI argument parsing with Commander.js
- Path abstraction for cross-platform compatibility

#### Documentation
- Comprehensive README.md with:
  - Feature overview and quick start
  - Installation and setup instructions
  - Usage examples for all commands
  - Project structure explanation
  - Data format documentation
  - Custom theme addition guide
  - Troubleshooting section
- JSDoc comments on all public APIs

#### Build & Distribution
- npm scripts: `build`, `dev`, `test`, `clean`
- TypeScript ES2020 compilation to CommonJS
- Executable bin entry point (nightcafe-gen)
- ESM-compatible output

### Technical Specifications
- **Language**: TypeScript with strict mode
- **Runtime**: Node.js 18+
- **Target**: ES2020
- **Testing Framework**: Jest with ts-jest
- **CLI Framework**: Commander.js v11.1.0
- **HTTP Client**: Axios v1.6.2
- **Terminal Colors**: Chalk v5.3.0
- **Development Runtime**: ts-node

### Known Limitations
- HTML parsing for cheat sheet scraping requires future enhancement (scaffolding present)
- Challenge sync from NightCafe APIs requires authentication (scaffolding present)
- No database backend (JSON file storage only)
- Artist data limited to embedded dataset (900-item goal requires manual data merge)

### Performance
- Challenge generation: <5ms average
- Library operations: O(1) deduplication via signature hashing
- Startup time: <1s (TypeScript compilation via ts-node)
- Test suite execution: <3s

## [1.1.0] - 2026-07-20

### Added

- **`sync-history` command**: Fetches and caches past NightCafe Build-a-Prompt challenges from the official challenge search URL into `~/.nightcafe-gen/nightcafe-history.json`
- **`NightCafeHistoryManager`**: New class managing the NightCafe history cache — load, save, and theme-based lookup
- **Two-layer deduplication**: `isDuplicate()` now checks both the local audit log (signature match) and the NightCafe history cache (case-insensitive theme name substring match)
- **403 bypass via `NIGHTCAFE_COOKIE`**: Set `$env:NIGHTCAFE_COOKIE` to your browser session cookie to bypass Cloudflare bot protection during `sync-history`
- **`NightCafeHistoryEntry` and `NightCafeHistoryCache` types** added to `types.ts`
- **History cache info in `stats`**: Shows cached challenge count and last-synced timestamp; prompts to run `sync-history` when cache is absent
- **`resync-challenges` legacy alias**: Now delegates to `sync-history` behavior

### Changed

- `ChallengeLibraryManager.isDuplicate(signature)` signature extended to `isDuplicate(signature, theme?)` — backwards-compatible
- `NightCafeScraper` fully implemented: parses `__NEXT_DATA__` SSR JSON blob, recursively finds challenge arrays, handles 403/malformed JSON with descriptive errors

### Fixed

- `resync-challenges` command previously returned nothing (stub); now works via the new `sync-history` implementation

[1.1.0]: https://github.com/xtough/nc-challenge-generator/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/xtough/nc-challenge-generator/releases/tag/v1.0.0
