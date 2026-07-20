## Context

The GitHub Actions workflow (`.github/workflows/node.js.yml`) runs `npm test` directly without first building the TypeScript code. The current workflow steps are:
1. Checkout
2. Setup Node.js
3. npm ci (install dependencies)
4. npm run build (if present)
5. npm test

The issue is that Jest (the test runner) tries to execute TypeScript files directly, which Node.js cannot interpret without transpilation. The build step exists but is run with `--if-present`, making it optional. We need to ensure the build always runs and completes before tests.

## Goals / Non-Goals

**Goals:**
- Ensure TypeScript is always compiled to JavaScript before running tests
- Fix SyntaxErrors in CI/CD by making the build step mandatory
- Keep the build step efficient (cache dependencies, reuse between matrix entries)
- Maintain compatibility with multiple Node.js versions (18.x, 20.x, 22.x)
- Preserve all existing test functionality

**Non-Goals:**
- Changing the test runner or configuration
- Modifying the build output directory structure
- Changing any application code or tests themselves
- Migrating away from TypeScript or Jest

## Decisions

**Decision 1: Make build step mandatory (remove --if-present flag)**
- Rationale: The build MUST run before tests. Making it optional hides the issue and causes failures
- Alternative considered: Keep --if-present but add conditional logic (rejected - adds complexity)
- Implementation: Remove `--if-present` flag from `npm run build`

**Decision 2: Keep build and test steps sequential for each matrix entry**
- Rationale: Each Node.js version should build and test independently. The package-lock.json cache uses a pattern that already points to the project directory
- Alternative considered: Separate matrix jobs for build vs test (rejected - unnecessary overhead)
- Implementation: Add `working-directory: nightcafe-challenge-generator` to both build and test steps

**Decision 3: No changes to dist/ output or TypeScript configuration**
- Rationale: The current build process (tsc) already produces correct output
- Implementation: Keep tsconfig.json unchanged

## Risks / Trade-offs

**[Risk] Build step adds time to CI/CD**
→ Mitigation: Build is already in the workflow and is required. This just ensures it runs before tests. No additional time cost.

**[Risk] If build fails, tests don't run**
→ Mitigation: This is correct behavior. Tests should fail if TypeScript doesn't compile. Currently masked by SyntaxErrors during test run.

**[Risk] Cache invalidation**
→ Mitigation: npm cache is already configured with cache-dependency-path. No changes needed.

## Migration Plan

1. Update `.github/workflows/node.js.yml`:
   - Change `npm run build --if-present` to `npm run build`
   - Verify working-directory is set for build step (already set for test)

2. Push changes to main branch

3. GitHub Actions will automatically pick up the new workflow

4. Verify workflow passes for all Node.js versions

## Open Questions

- Are there any other workflows that might have the same issue? (Answer: Only node.js.yml appears to run tests)
