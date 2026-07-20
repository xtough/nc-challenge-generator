## 1. Identify and Update Workflow

- [x] 1.1 Locate `.github/workflows/node.js.yml` in the repository
- [x] 1.2 Review current workflow steps to confirm build command uses `--if-present` flag
- [x] 1.3 Understand the issue: build step is optional, allowing tests to run against raw TypeScript

## 2. Fix the Workflow

- [x] 2.1 Remove `--if-present` flag from `npm run build` step
- [x] 2.2 Verify `working-directory: nightcafe-challenge-generator` is set on the build step
- [x] 2.3 Confirm build step is positioned before `npm test` in the workflow

## 3. Verify Syntax and Structure

- [x] 3.1 Validate YAML syntax of `.github/workflows/node.js.yml` is correct
- [x] 3.2 Ensure indentation and formatting are consistent with GitHub Actions spec
- [x] 3.3 Verify matrix configuration still works for all Node.js versions (18.x, 20.x, 22.x)

## 4. Test the Fix

- [x] 4.1 Commit the workflow change
- [x] 4.2 Push to a test branch or to main
- [x] 4.3 Wait for GitHub Actions to run the workflow
- [x] 4.4 Verify workflow passes for all Node.js versions
- [x] 4.5 Confirm no SyntaxErrors appear in test output
- [x] 4.6 Verify build step completes successfully before test step

## 5. Finalization

- [x] 5.1 Review workflow run logs to confirm build output is available during tests
- [x] 5.2 Update any documentation if needed (unlikely for this fix)
- [x] 5.3 Verify the fix resolves the original issue completely
