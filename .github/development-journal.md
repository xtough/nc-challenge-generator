# Development Journal

## Software Stack Information
- Runtime: Node.js 24+
- Language: TypeScript (strict mode)
- Test framework: Jest with ts-jest
- CI: GitHub Actions using actions/setup-node and npm cache

## Key Decisions
- Standardized runtime support to Node.js 24+ across package engines, CI workflow, and README prerequisites.
- Reduced CI matrix to a single supported version (24.x) for deterministic, policy-aligned builds.

## Core Features
- Generate NightCafe Build-a-Prompt challenge sets by theme.
- Persist local challenge history and prevent duplicates.
- Sync NightCafe history cache for additional duplicate detection.
- Output in pretty, markdown, and JSON formats.
