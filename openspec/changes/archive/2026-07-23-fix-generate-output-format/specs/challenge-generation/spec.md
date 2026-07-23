## MODIFIED Requirements

### Requirement: Configure items per category

The system SHALL allow configuration of how many items to suggest per category. Artist count uses the same default as all other categories (5).

#### Scenario: Default item count
- **WHEN** no configuration is specified
- **THEN** system uses 5 items per category including artist

#### Scenario: Custom item count
- **WHEN** user runs `nightcafe-gen --items 10`
- **THEN** system generates challenge with 10 items per category including artist

#### Scenario: Override specific category
- **WHEN** user runs `nightcafe-gen --subjects 3`
- **THEN** subjects category has 3 suggestions and other categories including artist have default 5

#### Scenario: Artist count matches other categories
- **WHEN** a challenge is generated with default settings
- **THEN** artist category contains 5 artists, same as subject, setting, mood, medium, and style
