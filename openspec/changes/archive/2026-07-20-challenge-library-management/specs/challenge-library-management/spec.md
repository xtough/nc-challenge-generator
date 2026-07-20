## MODIFIED Requirements

### Requirement: Avoid generating duplicate challenges

The system SHALL check for duplicates against the cached NightCafe challenge history before returning a generated challenge.

#### Scenario: Duplicate detection against NightCafe history
- **WHEN** a challenge is generated whose theme matches a title in the NightCafe history cache
- **THEN** system recognizes it as duplicate and notifies the user

#### Scenario: Duplicate detection against local log
- **WHEN** a challenge is generated that matches a locally-generated challenge in the audit log
- **THEN** system recognizes it as duplicate and notifies the user

#### Scenario: Match criteria for NightCafe history
- **WHEN** evaluating uniqueness against NightCafe history
- **THEN** a challenge is considered duplicate if its theme name appears (case-insensitive) in any cached NightCafe challenge title

#### Scenario: No history cache present
- **WHEN** the NightCafe history cache file does not exist
- **THEN** deduplication proceeds using only the local audit log and a warning is shown prompting the user to run `sync-history`

### Requirement: Resync library from online source

The system SHALL provide a `sync-history` subcommand to fetch and cache past NightCafe Build-a-Prompt challenges from the official challenge search URL.

#### Scenario: Sync NightCafe challenge history
- **WHEN** user runs `nightcafe-gen sync-history`
- **THEN** system fetches the NightCafe challenge search page and stores a local cache of challenge titles and dates in `~/.nightcafe-gen/nightcafe-history.json`

#### Scenario: Parse challenge titles from page
- **WHEN** fetching challenge history
- **THEN** system extracts challenge titles from the `__NEXT_DATA__` JSON embedded in the initial HTML response

#### Scenario: Incremental cache update
- **WHEN** sync-history runs and cache already exists
- **THEN** newly found challenges are merged into the cache without duplicating existing entries

#### Scenario: Network failure during sync
- **WHEN** network request fails during sync-history
- **THEN** system reports the error, preserves the existing cache unchanged, and exits with a non-zero code

#### Scenario: Show last synced timestamp
- **WHEN** user runs `nightcafe-gen stats`
- **THEN** output includes the timestamp of the last successful `sync-history` run and the number of cached NightCafe challenges

## ADDED Requirements

### Requirement: NightCafe history cache format

The system SHALL store the NightCafe challenge history cache in a structured JSON format separate from the local generation audit log.

#### Scenario: Cache file location
- **WHEN** sync-history completes
- **THEN** cache is written to `~/.nightcafe-gen/nightcafe-history.json`

#### Scenario: Cache entry structure
- **WHEN** accessing cache data
- **THEN** each entry has: title (string), fetchedAt (ISO timestamp)

#### Scenario: Cache is independent of local log
- **WHEN** user clears the local challenge library
- **THEN** the NightCafe history cache is NOT affected
