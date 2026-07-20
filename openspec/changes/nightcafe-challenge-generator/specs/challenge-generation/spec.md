## ADDED Requirements

### Requirement: Generate random challenge with themed categories

The system SHALL generate a Build-a-Prompt challenge with a random theme and intelligently selected category items that align thematically.

#### Scenario: Generate with default settings
- **WHEN** user runs `nightcafe-gen` without arguments
- **THEN** system generates a new challenge with random theme and 5 items per category (except mandatory keyword)

#### Scenario: Theme keyword is always present
- **WHEN** any challenge is generated
- **THEN** the mandatory keyword is always included in the challenge and not offered as a choice

#### Scenario: Categories match theme
- **WHEN** a challenge is generated for a specific theme
- **THEN** subject, setting, mood, and style items are semantically related to that theme

### Requirement: Generate challenge for specified theme

The system SHALL generate a challenge for a user-specified theme.

#### Scenario: Generate with explicit theme
- **WHEN** user runs `nightcafe-gen --theme vikings`
- **THEN** system generates challenge with "Vikings" theme and thematically matching categories

#### Scenario: Invalid theme
- **WHEN** user runs with non-existent theme
- **THEN** system displays error and lists available themes

### Requirement: Configure items per category

The system SHALL allow configuration of how many items to suggest per category.

#### Scenario: Default item count
- **WHEN** no configuration is specified
- **THEN** system uses 5 items per category (except mandatory keyword)

#### Scenario: Custom item count
- **WHEN** user runs `nightcafe-gen --items 10`
- **THEN** system generates challenge with 10 items per category

#### Scenario: Override specific category
- **WHEN** user runs `nightcafe-gen --artists 20`
- **THEN** artist category has 20 suggestions while other categories have 5
