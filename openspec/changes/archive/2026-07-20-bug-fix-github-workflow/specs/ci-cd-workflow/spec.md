## MODIFIED Requirements

### Requirement: CI/CD build process

The GitHub Actions workflow SHALL execute the TypeScript build step **before** running tests to ensure all source code is compiled to JavaScript.

#### Scenario: Build runs before tests
- **WHEN** GitHub Actions workflow is triggered
- **THEN** the build step (npm run build) executes before the test step (npm test)

#### Scenario: Build failure blocks tests
- **WHEN** the TypeScript build fails (npm run build returns non-zero exit code)
- **THEN** the workflow stops and does not proceed to npm test

#### Scenario: Tests run against compiled code
- **WHEN** the build step completes successfully
- **THEN** npm test executes against the compiled JavaScript output in dist/

#### Scenario: No SyntaxErrors from TypeScript
- **WHEN** npm test runs after successful build
- **THEN** no SyntaxError is raised due to uncompiled TypeScript syntax
