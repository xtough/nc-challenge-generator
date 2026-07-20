## ADDED Requirements

### Requirement: Match categories to theme

The system SHALL intelligently select category items that align with the challenge theme.

#### Scenario: Thematic subject selection
- **WHEN** a challenge is generated for "Vikings" theme
- **THEN** subject/character suggestions are historically or mythologically relevant (warrior, raider, explorer, etc.)

#### Scenario: Thematic setting selection
- **WHEN** a challenge is generated for "Gothic Victorian" theme
- **THEN** setting/environment suggestions match the aesthetic (manor, crypt, fog-shrouded streets, etc.)

#### Scenario: Thematic mood selection
- **WHEN** a challenge is generated for "Brutalism" theme
- **THEN** mood/atmosphere suggestions align (industrial, stark, imposing, austere, etc.)

#### Scenario: Thematic style selection
- **WHEN** a challenge is generated for "Whimsical" theme
- **THEN** style suggestions exclude dark/horror artists and favor fantasy/magical styles

#### Scenario: Random theme has coherent categories
- **WHEN** a random theme is generated
- **THEN** all selected categories are internally coherent even though theme is random

### Requirement: Define theme library

The system SHALL include definitions of available themes with associated category mappings.

#### Scenario: Theme has properties
- **WHEN** a theme is defined
- **THEN** it includes: theme name, emoji, description, and category pools for subject/setting/mood/style

#### Scenario: Available themes
- **WHEN** user requests theme list
- **THEN** system shows all available themes from the theme library

#### Scenario: Theme-specific artists
- **WHEN** theme defines style/artist preferences
- **THEN** artist suggestions are filtered to match theme aesthetic

### Requirement: Support random theme generation

The system SHALL generate random valid themes.

#### Scenario: Random theme selection
- **WHEN** user runs `nightcafe-gen` without theme parameter
- **THEN** system randomly selects from available themes

#### Scenario: Random theme is valid
- **WHEN** a random theme is selected
- **THEN** all its properties are defined and category items are available
