## 1. Move Project Files

- [x] 1.1 `git mv` all top-level files and directories from `nightcafe-challenge-generator/` to the repo root: `src/`, `data/`, `jest.config.ts`, `package.json`, `package-lock.json`, `tsconfig.json`, `CHANGELOG.md`, `README.md`
- [x] 1.2 Remove the now-empty `nightcafe-challenge-generator/` directory

## 2. Update Configuration Files

- [x] 2.1 Update `.gitignore` at the repo root — remove or merge the `nightcafe-challenge-generator/.gitignore` rules into the root `.gitignore`, then delete `nightcafe-challenge-generator/.gitignore`
- [x] 2.2 Verify `package.json` `bin` entry still points to `dist/cli.js` (path is already relative — no change needed unless absolute paths were used)
- [x] 2.3 Verify `tsconfig.json` `rootDir`/`outDir` paths are still correct relative to the new location
- [x] 2.4 Verify `jest.config.ts` `roots` and `testMatch` paths are still correct

## 3. Update CI Workflow

- [x] 3.1 Remove `working-directory: nightcafe-challenge-generator` from all steps in `.github/workflows/node.js.yml`
- [x] 3.2 Update `cache-dependency-path` from `nightcafe-challenge-generator/package-lock.json` to `package-lock.json`

## 4. Verify

- [x] 4.1 Run `npm install` from the repo root and confirm it succeeds
- [x] 4.2 Run `npm run build` from the repo root and confirm `dist/` is produced
- [x] 4.3 Run `npm test` from the repo root and confirm all 92 tests pass
- [x] 4.4 Run `node dist/cli.js --help` and confirm the CLI works

## 5. Commit

- [x] 5.1 Commit all changes in a single commit with message `refactor: flatten project structure — move nightcafe-challenge-generator/ to repo root`
