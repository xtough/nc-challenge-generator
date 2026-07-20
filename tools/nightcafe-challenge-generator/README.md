# NightCafe Challenge Generator

A CLI tool to generate NightCafe "Build-a-Prompt" challenges with themed categories, artist suggestions, and automatic deduplication.

## Features

✨ **Intelligent Theme Generation**
- 12+ pre-built themes (Vikings, Gothic Victorian, Brutalism, etc.)
- Thematically coherent category suggestions
- Random theme selection or specify your own

🎨 **Artist Suggestions**
- ~900 artists from Stable Diffusion cheat sheet
- Organized by style, era, and theme affinity
- Updateable via `--resync-artists` command

📚 **Challenge Library Management**
- Automatic deduplication prevents duplicate challenges
- Full history tracking with search capability
- Persistent storage in `~/.nightcafe-gen/`

📤 **Multi-Format Output**
- **Pretty-print**: Formatted for direct terminal reading
- **Markdown**: Share-ready format with proper structuring
- **JSON**: Programmatic access to challenge data

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### From Source

```bash
git clone <repo>
cd tools/nightcafe-challenge-generator
npm install
npm run build
npm link  # Install globally (optional)
```

## Quick Start

### Generate a Random Challenge

```bash
nightcafe-gen
# or
nightcafe-gen generate
```

### Generate Challenge for Specific Theme

```bash
nightcafe-gen --theme Vikings
nightcafe-gen --theme "Gothic Victorian"
```

### View Available Themes

```bash
nightcafe-gen themes
```

### Customize Items Per Category

```bash
# 10 items per category
nightcafe-gen --items 10

# Override specific categories
nightcafe-gen --subjects 15 --artists 8 --moods 5
```

### Output Formats

```bash
# Pretty-print (default) to stdout
nightcafe-gen

# To markdown file
nightcafe-gen --format markdown --output challenge.md

# To JSON file
nightcafe-gen --format json --output challenge.json

# All formats at once
nightcafe-gen --format all --output challenge
# Creates: challenge.md, challenge.json, prints to terminal
```

### View Challenge History

```bash
# Last 10 challenges
nightcafe-gen history

# Last 20 challenges
nightcafe-gen history --limit 20

# Filter by theme
nightcafe-gen history --theme Vikings

# Search challenges
nightcafe-gen history --search "Norse"

# Output as JSON
nightcafe-gen history --format json
```

### Library Statistics

```bash
nightcafe-gen stats
```

### Clear Challenge Library

```bash
# Clear challenges older than 30 days
nightcafe-gen clear --old 30 --confirm

# Clear entire library
nightcafe-gen clear --confirm
```

## Update Artist Dataset

```bash
# Fetch latest artists from Stable Diffusion cheat sheet
nightcafe-gen resync-artists
```

## Update Challenge Library from NightCafe

```bash
# Sync finished challenges (if scraping is available)
nightcafe-gen resync-challenges
```

## Project Structure

```
tools/nightcafe-challenge-generator/
├── src/
│   ├── types.ts              # TypeScript interfaces
│   ├── ChallengeGenerator.ts  # Main generator logic
│   ├── ThemeMatcher.ts        # Theme selection logic
│   ├── ChallengeLibraryManager.ts  # Dedup & history
│   ├── OutputFormatter.ts     # Output formatting
│   ├── OutputManager.ts       # File I/O
│   ├── Scrapers.ts            # Web scrapers
│   ├── cli.ts                 # CLI entry point
│   └── index.ts               # Exports
├── data/
│   ├── artists.json           # Artist dataset
│   └── themes.json            # Theme definitions
├── dist/                      # Compiled JavaScript
├── package.json
└── tsconfig.json
```

## Data Format

### themes.json

```json
{
  "themes": [
    {
      "name": "Vikings",
      "emoji": "🛶🌳🐍",
      "mandatoryKeyword": "Norse mythology",
      "description": "...",
      "categories": {
        "subject": ["warrior", "raider", "explorer", ...],
        "setting": ["fjord", "longship", ...],
        "mood": ["fierce", "adventurous", ...],
        "medium": ["oil painting", "concept art", ...],
        "style": ["realistic", "fantasy", ...]
      }
    }
  ]
}
```

### artists.json

```json
{
  "artists": [
    {
      "name": "Leonardo da Vinci",
      "aliases": ["da Vinci", "Leonardo"],
      "era": "Renaissance",
      "styles": ["classical", "anatomical", ...],
      "medium": "oil",
      "themes": ["renaissance", "classical", ...]
    }
  ]
}
```

## Adding Custom Themes

Edit `data/themes.json` to add new themes:

```json
{
  "name": "Cyberpunk",
  "emoji": "🤖💾",
  "mandatoryKeyword": "High-tech neon dystopia",
  "description": "Futuristic tech-dominated societies",
  "categories": {
    "subject": [...],
    "setting": [...],
    "mood": [...],
    "medium": [...],
    "style": [...]
  }
}
```

## Output Examples

### Pretty-Print

```
============================================================
🏗️  BUILD A PROMPT 🏗️  Vikings 🛶🌳🐍
============================================================

📌 Mandatory Keyword: Norse mythology

✨ Pick 1 item from each category below:

📍 SUBJECT:
   1. warrior
   2. raider
   3. explorer
   ...
```

### Markdown

```markdown
# 🏗️ BUILD A PROMPT 🏗️ Vikings 🛶🌳🐍

**Mandatory Keyword:** Norse mythology

## Instructions
Pick **1 item** from each category below...

### Subject
- warrior
- raider
- explorer
```

## Troubleshooting

### Command Not Found

If `nightcafe-gen` command is not found after `npm link`, check:
```bash
npm config get prefix  # Check npm global install directory
echo $PATH             # Verify it's in your PATH
```

### Resync Artists Fails

The artist scraper depends on the cheat sheet HTML structure. If it fails:
1. Check internet connection
2. Verify URL: https://supagruen.github.io/StableDiffusion-CheatSheet/
3. Use existing embedded dataset if resync is unavailable

### Challenge Library Issues

Library is stored in `~/.nightcafe-gen/challenges-library.json`. To reset:
```bash
nightcafe-gen clear --confirm
```

## Development

### Build

```bash
npm run build
```

### Run Tests

```bash
npm test
```

### Development Mode

```bash
npm run dev -- generate --theme Vikings
```

## Performance

- Challenge generation: < 100ms
- Library operations: O(n) for search, O(1) for duplicate check
- File I/O: ~10-50ms depending on library size

## License

MIT

## Contributing

Contributions welcome! Please ensure:
- Tests pass: `npm test`
- Code builds: `npm run build`
- Types are correct: TypeScript strict mode

## Changelog

See [CHANGELOG.md](../../CHANGELOG.md) for release history.
