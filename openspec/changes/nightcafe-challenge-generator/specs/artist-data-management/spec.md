## ADDED Requirements

### Requirement: Embedded artist dataset

The system SHALL include an embedded dataset of ~900 artists and their styles extracted from the Stable Diffusion cheat sheet.

#### Scenario: Artist data is available offline
- **WHEN** system initializes
- **THEN** embedded artists.json contains all ~900 artists with associated styles

#### Scenario: Each artist has style metadata
- **WHEN** generating a challenge
- **THEN** each artist in the dataset has one or more associated art styles for context

#### Scenario: Artists are used in style category
- **WHEN** building category suggestions
- **THEN** artist suggestions can be filtered or matched based on theme

### Requirement: Resync artist data from online source

The system SHALL provide a command to update the embedded artist dataset from the Stable Diffusion cheat sheet.

#### Scenario: Manual resync with online source
- **WHEN** user runs `nightcafe-gen --resync-artists`
- **THEN** system fetches latest artists from cheat sheet URL and updates embedded dataset

#### Scenario: Resync preserves existing data
- **WHEN** resync completes
- **THEN** any new or updated artists are merged, old entries are preserved if still in source

#### Scenario: Offline fallback
- **WHEN** resync fails (network error)
- **THEN** system continues using current embedded dataset and logs warning

### Requirement: Artist dataset format

The system SHALL store artist data in a structured JSON format with artist name and associated styles.

#### Scenario: Artist record structure
- **WHEN** accessing artist data
- **THEN** each artist has: name (string), styles (array of strings), era (optional), medium (optional)

#### Scenario: Efficient lookup
- **WHEN** filtering artists by theme
- **THEN** lookup completes in O(1) for direct access
