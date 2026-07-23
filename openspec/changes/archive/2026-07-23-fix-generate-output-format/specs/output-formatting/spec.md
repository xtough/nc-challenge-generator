## MODIFIED Requirements

### Requirement: Output formatted for terminal (pretty-print)

The system SHALL display challenges as a flat bullet list matching NightCafe's published challenge format. Each line is a bullet with category items comma-separated. No category headers or numbered lists.

#### Scenario: Pretty-print to stdout
- **WHEN** user runs `nightcafe-gen`
- **THEN** challenge is displayed as a flat bullet list with one bullet per category, items comma-separated, mandatory keyword on the first bullet, and an example prompt at the bottom

#### Scenario: Default output format
- **WHEN** no output format is specified
- **THEN** system defaults to pretty-print (terminal-friendly flat list)

#### Scenario: Challenge header includes theme and emoji
- **WHEN** challenge is displayed
- **THEN** header shows the theme name and NightCafe challenge rules (pick 1 from each list, title rules, voting rules, allowed/disallowed actions)

#### Scenario: Output matches NightCafe flat bullet format
- **WHEN** pretty-print is generated
- **THEN** output matches the structure of `data/challenge-example.md`: one `- keyword (required)` line, then one `- Item1, Item2, Item3, Item4, Item5` bullet per category, then an example line

---

### Requirement: Output as markdown

The system SHALL generate markdown-formatted challenge output as a flat bullet list matching NightCafe's published challenge format.

#### Scenario: Markdown output matches NightCafe format
- **WHEN** user runs `nightcafe-gen --format markdown`
- **THEN** challenge is formatted as a flat bullet list matching `data/challenge-example.md`, not a numbered list with headers

#### Scenario: Markdown file output
- **WHEN** user runs `nightcafe-gen --format markdown --output challenge.md`
- **THEN** challenge is written to specified file in NightCafe-compatible flat bullet format

#### Scenario: Markdown includes all categories
- **WHEN** markdown is generated
- **THEN** it contains one bullet per category with comma-separated items, no category name headers

#### Scenario: Example line at bottom
- **WHEN** any formatted output is generated
- **THEN** an example line at the bottom shows a sample combined prompt using the first item from each category
