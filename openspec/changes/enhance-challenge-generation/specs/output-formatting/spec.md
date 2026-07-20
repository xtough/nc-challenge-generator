# Delta Spec: Output Formatting

## MODIFIED Requirements

### Requirement: Output formatted for terminal (pretty-print)

The system SHALL display challenges in a formatted, human-readable way on the terminal. Artist category SHALL be displayed alongside subject, setting, mood, medium, and style.

#### Scenario: Pretty-print to stdout
- **WHEN** user runs `nightcafe-gen`
- **THEN** challenge is displayed with emoji, formatted category lists including artist, and proper spacing

#### Scenario: Default output format
- **WHEN** no output format is specified
- **THEN** system defaults to pretty-print (terminal-friendly)

#### Scenario: Challenge header includes theme and emoji
- **WHEN** challenge is displayed
- **THEN** header shows "🏗️ BUILD A PROMPT 🏗️ [THEME] [EMOJI]"

#### Scenario: Artist is included in output
- **WHEN** pretty-print is generated
- **THEN** artist category is displayed with all other categories in consistent format

---

### Requirement: Output as markdown

The system SHALL generate markdown-formatted challenge output suitable for sharing and copy-paste into NightCafe. Output format SHALL match NightCafe's published challenge text structure.

#### Scenario: Markdown output matches NightCafe format
- **WHEN** user runs `nightcafe-gen --format markdown`
- **THEN** challenge is formatted as markdown with category headers (`### CATEGORY_NAME`) and numbered item lists, matching NightCafe challenge convention

#### Scenario: Markdown file output
- **WHEN** user runs `nightcafe-gen --format markdown --output challenge.md`
- **THEN** challenge is written to specified file in NightCafe-compatible markdown format

#### Scenario: Markdown includes all categories with artist
- **WHEN** markdown is generated
- **THEN** it contains SUBJECT, SETTING, MOOD, ARTIST, MEDIUM, STYLE headers with numbered lists and aligns with NightCafe challenge text

#### Scenario: Artist category appears in correct position
- **WHEN** markdown is generated
- **THEN** artist category appears between mood and medium categories

---

### Requirement: Output as JSON

The system SHALL provide JSON output for programmatic use. Artist category SHALL be included in all JSON outputs.

#### Scenario: JSON output
- **WHEN** user runs `nightcafe-gen --format json`
- **THEN** system outputs structured JSON to stdout with artist in categories

#### Scenario: JSON file output
- **WHEN** user runs `nightcafe-gen --format json --output challenge.json`
- **THEN** challenge is written to specified file in JSON format with artist included

#### Scenario: JSON structure includes artist
- **WHEN** JSON is generated
- **THEN** it contains: theme, mandatoryKeyword, categories (object with subject, setting, mood, artist, medium, style arrays)

---

### Requirement: Multi-format simultaneous output

The system MAY generate challenge in multiple formats at once.

#### Scenario: Generate all formats
- **WHEN** user runs `nightcafe-gen --format all`
- **THEN** challenge is output to terminal with artist, saved as challenge.md in NightCafe format, and saved as challenge.json with artist category included
