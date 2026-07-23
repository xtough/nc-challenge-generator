# Spec: Challenge Generation

## Purpose

Core challenge generation engine for creating NightCafe Build-a-Prompt challenges. Supports random theme selection, targeted theme generation, and configurable item counts per category.

---

## Requirements

### Requirement: Generate random challenge with themed categories

The system SHALL generate a Build-a-Prompt challenge with a random theme and intelligently selected category items that align thematically. All challenges SHALL include an artist from the artist library.

#### Scenario: Generate with default settings
- **WHEN** user runs `nightcafe-gen` without arguments
- **THEN** system generates a new challenge with random theme, 5 items per category (except mandatory keyword and artist), and 1 artist aligned with the theme

#### Scenario: Theme keyword is always present
- **WHEN** any challenge is generated
- **THEN** the mandatory keyword is always included in the challenge and not offered as a choice

#### Scenario: Categories match theme
- **WHEN** a challenge is generated for a specific theme
- **THEN** subject, setting, mood, medium, artist, and style items are semantically related to that theme

#### Scenario: Artist is theme-compatible
- **WHEN** a challenge is generated
- **THEN** selected artist SHALL have one or more styles that match a style in the theme's style pool

#### Scenario: Style refers to artistic movement, not generic descriptor
- **WHEN** a challenge is generated
- **THEN** style category contains authentic artistic movements/epochs (e.g., Romanticism, Renaissance, Surrealism, Grunge) not generic descriptors (e.g., dramatic, realistic)

---

### Requirement: Generate challenge for specified theme

The system SHALL generate a challenge for a user-specified theme, including an artist selection.

#### Scenario: Generate with explicit theme
- **WHEN** user runs `nightcafe-gen --theme vikings`
- **THEN** system generates challenge with "Vikings" theme, thematically matching categories, and one theme-compatible artist

#### Scenario: Invalid theme
- **WHEN** user runs with non-existent theme
- **THEN** system displays error and lists available themes

---

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

---

### Requirement: Select artist from library

The system SHALL select a random artist from the embedded artist library, filtered to match the challenge theme.

#### Scenario: Artist selection respects theme
- **WHEN** generating a challenge for the "Steampunk" theme
- **THEN** artist is randomly selected from those whose styles include Steampunk or related industrial art movement

#### Scenario: No theme-compatible artists found
- **WHEN** generating a challenge and no artists match the theme's styles
- **THEN** system falls back to random artist from the entire library

#### Scenario: Multiple artists available
- **WHEN** generating a challenge for a popular theme (e.g., "Fantasy")
- **THEN** artist is randomly selected from all available theme-compatible artists (each run produces different artist)
