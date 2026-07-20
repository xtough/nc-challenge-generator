## Context

The nightcafe-challenge-generator is currently located at `tools/nightcafe-challenge-generator/` within the workspace. This nested structure creates unnecessary path complexity when developers work with the project. The internal directory structure (src/, data/, __tests__/) is well-organized and doesn't need changes.

Current references to this project:
- Relative imports within the project use `./` paths
- CI/CD workflows reference `tools/nightcafe-challenge-generator/` 
- Build scripts and documentation assume the tools/ prefix
- Package.json defines scripts for building and testing

## Goals / Non-Goals

**Goals:**
- Move nightcafe-challenge-generator to workspace root level
- Update all file references (imports, scripts, CI/CD, docs) to reflect new location
- Maintain all existing functionality and test coverage
- Ensure build, test, and CLI commands work from the new location

**Non-Goals:**
- Not restructuring the internal directory layout of the project
- Not changing any functionality or modifying code logic
- Not updating package version or API
- Not migrating to a monorepo or workspaces setup

## Decisions

**Decision 1: Move entire directory as-is to workspace root**
- Rationale: The internal structure is already well-organized. Moving the entire directory preserves the project's autonomy and makes it a top-level citizen without requiring internal refactoring.
- Alternatives considered: Flattening structure (rejected - adds unnecessary churn), moving only src/ (rejected - requires splitting related assets)

**Decision 2: Update paths to use workspace-relative references**
- Rationale: References in CI/CD, docs, and scripts should use paths relative to workspace root (e.g., `nightcafe-challenge-generator/` instead of `tools/nightcafe-challenge-generator/`)
- Alternatives considered: Using absolute paths (rejected - less portable), keeping tools/ symlink (rejected - creates confusion)

**Decision 3: Update build scripts and CI/CD workflows incrementally**
- Rationale: Update references in package.json, GitHub workflows, and any build configuration systematically to reduce breakage
- Alternatives considered: Bulk find-replace (rejected - too risky, need manual verification)

## Risks / Trade-offs

**[Risk] Import paths may break if internal references not fully updated**
→ Mitigation: Search for all references to old path, verify all test pass after move

**[Risk] CI/CD workflows may fail during transition**
→ Mitigation: Test locally first, keep old workflow active until new one passes

**[Risk] External documentation or references to the old path**
→ Mitigation: Check README, contributor guides, and any external links, update as needed

## Migration Plan

1. Move directory from `tools/nightcafe-challenge-generator` to `nightcafe-challenge-generator` at workspace root
2. Update CI/CD workflow paths (`.github/workflows/`)
3. Update any documentation or README references to the old path
4. Verify all tests pass and build succeeds from new location
5. Commit with clear message about the structural change
