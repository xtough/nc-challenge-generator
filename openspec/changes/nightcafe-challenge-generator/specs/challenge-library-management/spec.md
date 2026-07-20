## ADDED Requirements

### Requirement: Track generated challenges

The system SHALL maintain a library of previously generated challenges to avoid duplicates.

#### Scenario: New challenge is recorded
- **WHEN** a challenge is generated
- **THEN** it is automatically added to the challenge library with timestamp

#### Scenario: Challenge library persists
- **WHEN** system terminates and restarts
- **THEN** challenge library data is preserved and accessible

#### Scenario: View challenge history
- **WHEN** user runs `nightcafe-gen --history`
- **THEN** system displays previously generated challenges sorted by date

### Requirement: Avoid generating duplicate challenges

The system SHALL check for duplicates before returning a generated challenge.

#### Scenario: Duplicate detection
- **WHEN** a challenge is generated that matches an existing entry in library
- **THEN** system recognizes it as duplicate and regenerates

#### Scenario: Match criteria
- **WHEN** evaluating uniqueness
- **THEN** a challenge is considered duplicate if same theme and same category items in same order

### Requirement: Resync library from online source

The system SHALL provide capability to rebuild challenge library from past challenges on NightCafe.

#### Scenario: Resync past challenges
- **WHEN** user runs `nightcafe-gen --resync-challenges`
- **THEN** system fetches finished challenges from NightCafe URL and adds them to library

#### Scenario: Incremental updates
- **WHEN** resync runs
- **THEN** new challenges are added without duplicating existing library entries

### Requirement: Challenge library format

The system SHALL store challenge data in structured JSON format.

#### Scenario: Challenge record
- **WHEN** accessing challenge data
- **THEN** each challenge has: theme, categories with items, mandatory keyword, generated timestamp
