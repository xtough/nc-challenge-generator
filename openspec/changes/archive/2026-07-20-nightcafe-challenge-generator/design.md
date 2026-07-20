## Context

The NightCafe Build-a-Prompt challenge format requires creating balanced category lists with items that cohere thematically. Currently, this is done manually, leading to repetition and inconsistency. A CLI generator can automate this while avoiding duplicate challenges through a library tracking system.

**Key constraints:**
- Must support ~900 artists from Stable Diffusion cheat sheet
- Manual copy-paste workflow (no automation to NightCafe needed)
- Offline-first (embedded data, not API-dependent)
- Extensible theme library
- Deterministic uniqueness checking to prevent duplicates

## Goals / Non-Goals

**Goals:**
- Eliminate manual challenge creation repetition
- Generate thematically coherent categories automatically
- Maintain deduplication via challenge library
- Support multiple output formats for different workflows
- Enable updating artist data from online source
- Provide extensible theme system

**Non-Goals:**
- Auto-posting to NightCafe
- Real-time collaboration on challenge editing
- Leaderboard or participation tracking
- Support for image generation (only prompt suggestions)

## Decisions

### 1. Technology Stack: Node.js + TypeScript

**Decision**: Use Node.js 18+ with TypeScript for CLI implementation.

**Rationale**: 
- Portable across Windows, macOS, Linux
- npm ecosystem for CLI tooling (Commander.js, Chalk, Inquirer)
- TypeScript provides type safety for complex data structures
- Easy distribution via npm or local installation

**Alternatives considered**:
- Python: More familiar for data processing, but less ideal for CLI UX
- Go: Faster binaries, but overkill for this use case
- Rust: Excellent CLI tooling, but higher complexity for data manipulation

### 2. Data Storage: Embedded JSON Files + Local Library

**Decision**: Store all data as JSON files in the package:
- `data/artists.json` (~900 artists with styles)
- `data/themes.json` (theme definitions and category pools)
- `~/.nightcafe-gen/challenges-library.json` (user's generated challenges, in home directory)

**Rationale**:
- No external API dependency for core functionality
- Fast, deterministic offline operation
- Human-readable for debugging and extension
- Version control friendly (specs/data in git)
- User library in home directory allows flexibility

**Alternatives considered**:
- SQLite database: Overkill for this data volume, harder to inspect
- Cloud storage: Breaks offline-first requirement
- Mixed (API + fallback): Complex fallback logic

### 3. Artist Data Structure

**Decision**: Parse cheat sheet into this structure:
```json
{
  "name": "Leonardo da Vinci",
  "aliases": ["da Vinci", "Leonardo"],
  "era": "Renaissance",
  "styles": ["classical", "anatomical", "detailed", "oil painting"],
  "medium": "oil",
  "themes": ["renaissance", "classical", "realism", "portraiture"]
}
```

**Rationale**:
- Aliases support fuzzy matching
- Themes enable filtering by theme relevance
- Medium/era provide context for intelligent selection
- Flat structure is O(1) lookup, suitable for filtering

### 4. Theme Matching: Pool-Based Selection

**Decision**: Each theme defines category pools (lists of valid items):
```json
{
  "name": "Vikings",
  "emoji": "🛶🌳🐍",
  "mandatoryKeyword": "Norse mythology",
  "categories": {
    "subject": ["warrior", "raider", "explorer", ...],
    "setting": ["fjord", "longship", "mead hall", ...],
    "mood": ["fierce", "adventurous", "primal", ...],
    "medium": ["oil painting", "concept art", ...],
    "style": ["realistic", "stylized", "fantasy", ...]
  }
}
```

**Rationale**:
- Pre-built pools ensure thematic coherence
- No complex matching algorithm needed
- Easy to extend with new themes
- Deterministic selection maintains reproducibility

**Alternatives considered**:
- AI-based matching: Too complex, unreliable
- Keyword-search matching: Brittle, requires constant updating

### 5. Deduplication: Exact Match Signature

**Decision**: Challenge uniqueness = (theme, category_items_in_order). Store hash of this signature in library.

**Rationale**:
- Simple, fast O(1) lookup
- Two challenges identical if same theme and same items (order matters)
- Regeneration on duplicate is automatic

### 6. Resync for Artist Data

**Decision**: Optional `--resync-artists` fetches cheat sheet HTML, parses, and merges into embedded data.

**Rationale**:
- Maintains freshness without breaking offline operation
- Explicit opt-in respects user workflow
- Merge strategy preserves local customizations

### 7. Output Formatting

**Decision**: Three formatters (pretty-print, markdown, JSON) as separate classes.

**Rationale**:
- Separation of concerns
- Easy to add new formats later
- Each formatter handles encoding/escaping properly

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| **Artist data staleness** | Provide `--resync-artists` for manual updates; document update frequency |
| **Cheat sheet URL changes** | Document URL in code; easy to update if needed |
| **Challenge library grows unbounded** | Implement optional `--clear-old` to remove challenges >N days old |
| **Random theme collision** | Low probability with 15+ themes, but duplicates auto-regenerate anyway |
| **Users with custom themes can't share** | Document how to merge theme definitions; consider future theme import feature |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                 CLI Entry Point                      │
│              (nightcafe-gen command)                │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   ┌─────────┐  ┌──────────┐  ┌──────────┐
   │Generator │  │ Resync   │  │ Library  │
   │ Engine   │  │ Manager  │  │ Manager  │
   └─────────┘  └──────────┘  └──────────┘
        │            │            │
        └────────────┼────────────┘
                     ▼
        ┌────────────────────────┐
        │   Theme Matcher        │
        │   (Select from pools)  │
        └────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   ┌────────┐  ┌─────────┐  ┌────────┐
   │Pretty  │  │Markdown │  │ JSON   │
   │Printer │  │Formatter│  │Format. │
   └────────┘  └─────────┘  └────────┘
        │            │            │
        └────────────┼────────────┘
                     ▼
              User Output (stdout/file)
```

## Data Flow

```
nightcafe-gen --theme vikings --format markdown --output challenge.md

1. Parse CLI arguments
2. Load themes.json
3. Get "vikings" theme definition
4. Load artists.json
5. Generate: pick 1 from each category pool
6. Check challenges-library.json for duplicate
   → If duplicate: regenerate step 5, goto 6
   → If unique: proceed
7. Add to challenges-library.json
8. Format as Markdown (title, categories with items)
9. Write to challenge.md
10. Display confirmation to user
```

## Open Questions

- Should theme pools be editable by users? (future: config file import)
- How often should artist data be updated? (document recommended frequency)
- Should challenge library have automatic cleanup? (future: --clear-old flag)
