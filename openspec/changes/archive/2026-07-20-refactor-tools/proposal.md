## Why

The nightcafe-challenge-generator is a primary project in the workspace but is nested under `tools/`, creating unnecessary path complexity. Moving it to the root level clarifies the project structure and reduces path-based cognitive overhead for developers.

## What Changes

- Move `tools/nightcafe-challenge-generator/` to `nightcafe-challenge-generator/` at the workspace root
- Update all imports and path references that rely on the old location
- Update build scripts, CI/CD workflows, and documentation that reference the old path
- Update package.json and build configurations

## Capabilities

### New Capabilities
<!-- No new capabilities - this is a structural refactoring -->\

### Modified Capabilities
<!-- No requirement changes - this is a pure directory reorganization -->\

## Impact

- **Directory Structure**: Move requires updating relative paths in import statements
- **Build/Dev Scripts**: Update npm/build script working directories and paths
- **CI/CD Workflows**: Update workflow paths (e.g., in `.github/workflows/`)
- **Documentation**: Update any README or contributor guides referencing the old path
- **VSCode Settings**: May need to update any workspace-specific settings or paths
