## Why

The GitHub Actions CI/CD workflow fails with SyntaxErrors during the "npm test" phase because TypeScript source code is not being compiled to JavaScript before running tests. The test runner encounters raw TypeScript syntax that Node.js cannot execute.

## What Changes

- Add `npm run build` step to the CI/CD workflow **before** running `npm test`
- Ensure the build step runs for each Node.js version matrix entry
- Build output (dist/) is available when Jest runs, preventing SyntaxErrors
- Verify workflow executes correctly and all tests pass

## Capabilities

### New Capabilities
<!-- No new capabilities - this is a workflow fix -->

### Modified Capabilities
- `ci-cd-workflow`: Build step must run before tests to compile TypeScript to JavaScript

## Impact

- **CI/CD Workflow**: GitHub Actions workflow `.github/workflows/node.js.yml` needs modification
- **Build Process**: Ensures TypeScript compilation happens automatically during CI
- **No breaking changes**: Tests still run the same way, just with compiled code available
- **Developer Experience**: Prevents false test failures due to missing build step
