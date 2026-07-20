## ADDED Requirements

<!-- This is a structural refactoring with no new capabilities or modified requirements.
     The nightcafe-challenge-generator project is moved from tools/ to the workspace root.
     All existing functionality and APIs remain unchanged.
     No new specs files needed - this change affects directory structure only. -->

### Requirement: Project directory structure refactoring

The nightcafe-challenge-generator project SHALL be relocated from `tools/nightcafe-challenge-generator/` to `nightcafe-challenge-generator/` at the workspace root level.

#### Scenario: Project location
- **WHEN** developers reference the nightcafe-challenge-generator project
- **THEN** it is located at the workspace root as `nightcafe-challenge-generator/`

#### Scenario: Functionality preserved
- **WHEN** the project is moved
- **THEN** all existing functionality, APIs, and command-line interfaces remain unchanged
