## Context

The project is a Node.js/TypeScript CLI tool. Its source currently lives inside `nightcafe-challenge-generator/`, which is the only application in this repository. Every `npm` command, CI step, and path reference must include that prefix, adding unnecessary indirection.

## Goals / Non-Goals

**Goals:**
- Move all project files to the repo root so `npm install`, `npm test`, and `npm run build` work from `/`
- Update CI workflow to remove `working-directory` overrides
- Keep all relative internal paths (`src/`, `dist/`, `data/`) unchanged

**Non-Goals:**
- Changing any source code behaviour
- Renaming packages, modules, or binaries
- Restructuring `src/` internals

## Decisions

**Move files with `git mv`, not copy+delete**
Preserves full commit history on every file. Alternative (delete and re-add) would orphan history.

**Single atomic commit for the move**
All path-dependent files (`.gitignore`, `package.json`, `tsconfig.json`, `jest.config.ts`, CI workflow) must be updated in the same commit as the file moves, or the build breaks mid-history.

**Keep `openspec/` and `.github/` in place**
These are already at the repo root and need no changes beyond the CI workflow file.

## Risks / Trade-offs

- [Any local clone with uncommitted changes in `nightcafe-challenge-generator/`] → Commit or stash before the move
- [Global npm install shim points to old path] → Re-run `npm install -g .` after the move if needed
- [CI cache key references old path] → `cache-dependency-path` in the workflow must be updated in the same commit

## Migration Plan

1. `git mv nightcafe-challenge-generator/{src,data,dist} .` and remaining files
2. Update `package.json`, `tsconfig.json`, `jest.config.ts`, `.gitignore`, `node.js.yml`
3. Run `npm install && npm run build && npm test` to verify
4. Single commit with all changes
5. No rollback complexity — revert the commit if needed
