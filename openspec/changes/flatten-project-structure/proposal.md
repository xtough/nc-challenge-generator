## Why

The project source lives inside a `nightcafe-challenge-generator/` subdirectory, adding an unnecessary path prefix to every command, script, and CI step. Flattening it to the workspace root removes that friction and aligns the repository layout with how the project is actually used.

## What Changes

- Move all files from `nightcafe-challenge-generator/` to the repo root
- Update `package.json` paths, `tsconfig.json`, and `jest.config.ts` to reflect the new layout
- Update `.gitignore` and `.github/workflows/node.js.yml` (`working-directory` and `cache-dependency-path` references)
- Remove the now-empty `nightcafe-challenge-generator/` directory

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `ci-cd-workflow`: `working-directory` and `cache-dependency-path` entries change from `nightcafe-challenge-generator/` to `.`

## Impact

- All `npm` commands run from the repo root instead of the subdirectory
- CI workflow steps no longer need `working-directory: nightcafe-challenge-generator`
- Internal source paths (`rootDir`, `outDir`, test roots) remain unchanged relative to `package.json`
