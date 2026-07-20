## ADDED Requirements

### Requirement: Output formatted for terminal (pretty-print)

The system SHALL display challenges in a formatted, human-readable way on the terminal.

#### Scenario: Pretty-print to stdout
- **WHEN** user runs `nightcafe-gen`
- **THEN** challenge is displayed with emoji, formatted category lists, and proper spacing

#### Scenario: Default output format
- **WHEN** no output format is specified
- **THEN** system defaults to pretty-print (terminal-friendly)

#### Scenario: Challenge header includes theme and emoji
- **WHEN** challenge is displayed
- **THEN** header shows "🏗️ BUILD A PROMPT 🏗️ [THEME] [EMOJI]"

### Requirement: Output as markdown

The system SHALL generate markdown-formatted challenge output suitable for sharing.

#### Scenario: Markdown output
- **WHEN** user runs `nightcafe-gen --format markdown`
- **THEN** challenge is formatted as markdown with proper headers and lists

#### Scenario: Markdown file output
- **WHEN** user runs `nightcafe-gen --format markdown --output challenge.md`
- **THEN** challenge is written to specified file in markdown format

#### Scenario: Markdown includes category structure
- **WHEN** markdown is generated
- **THEN** it contains category names and items as proper markdown lists

### Requirement: Output as JSON

The system SHALL provide JSON output for programmatic use.

#### Scenario: JSON output
- **WHEN** user runs `nightcafe-gen --format json`
- **THEN** system outputs structured JSON to stdout

#### Scenario: JSON file output
- **WHEN** user runs `nightcafe-gen --format json --output challenge.json`
- **THEN** challenge is written to specified file in JSON format

#### Scenario: JSON structure
- **WHEN** JSON is generated
- **THEN** it contains: theme, mandatoryKeyword, categories (object with name and items array)

### Requirement: Multi-format simultaneous output

The system MAY generate challenge in multiple formats at once.

#### Scenario: Generate all formats
- **WHEN** user runs `nightcafe-gen --format all`
- **THEN** challenge is output to terminal, saved as challenge.md, and saved as challenge.json
