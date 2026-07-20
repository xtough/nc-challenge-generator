## 1. Directory Structure Migration

- [x] 1.1 Move `tools/nightcafe-challenge-generator/` to `nightcafe-challenge-generator/` at workspace root
- [x] 1.2 Verify all subdirectories (src/, data/, __tests__/) are intact after move
- [x] 1.3 Verify `.openspec.yaml` and hidden files are preserved

## 2. CI/CD Workflow Updates

- [x] 2.1 Update `.github/workflows/node.js.yml` to use new project path (`nightcafe-challenge-generator/` instead of `tools/nightcafe-challenge-generator/`)
- [x] 2.2 Update any GitHub workflow job working directory (`working-directory` in workflow steps)
- [x] 2.3 Verify workflow paths for test runs, build, and artifact upload

## 3. Build and Development Scripts

- [x] 3.1 Check `package.json` scripts and update any absolute/relative paths if needed
- [x] 3.2 Update npm/build commands working directories in development scripts
- [x] 3.3 Verify `tsconfig.json` and any path mappings still work from new location

## 4. Documentation Updates

- [x] 4.1 Update main `README.md` to reference new project location if mentioned
- [x] 4.2 Update any developer guide or contributor docs referencing old path
- [x] 4.3 Update CHANGELOG.md with migration note

## 5. Testing and Verification

- [x] 5.1 Run `npm test` in the new project location to verify all tests pass
- [x] 5.2 Run `npm run build` to verify TypeScript compilation succeeds
- [x] 5.3 Test CLI commands (`npm run cli` or equivalent) to verify functionality
- [x] 5.4 Verify no broken imports or path references by running a full build

## 6. Finalization

- [x] 6.1 Verify `tools/` directory is empty (or remove if no other projects exist there)
- [x] 6.2 Commit the directory move with clear message about the refactoring
- [x] 6.3 Push to origin and verify CI/CD passes with new paths
- [x] 6.4 Update any external documentation or links to old project path (if applicable)
