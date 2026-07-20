## Why

The current challenge library tracks only locally-generated challenges for deduplication, meaning the generator has no awareness of past challenges that were actually run on NightCafe. This leads to regenerating challenges identical to ones that have already been posted, defeating the purpose of the deduplication system. The authoritative source of "already used" challenges is the NightCafe challenge history at a known public URL.

## What Changes

- Remove locally-generated challenges as the source of truth for deduplication; use the cached NightCafe challenge history instead
- Add a `sync-history` subcommand that fetches and caches past challenges from the NightCafe URL
- Parse NightCafe challenge titles/themes from the search results page to populate the local cache
- Deduplicate generated challenges against the cached NightCafe history rather than a self-maintained log
- Retain the local generation log as an audit trail (not for dedup decisions)

## Capabilities

### New Capabilities

_(none — this change modifies an existing capability)_

### Modified Capabilities

- `challenge-library-management`: Replace local-generation-log deduplication with NightCafe history cache as source of truth; add `sync-history` subcommand to update the cache from `https://creator.nightcafe.studio/search/challenges?sort=challenges%2Fsort%2FstartsAtMs%3Adesc&stillJoinable=false&status=finished&chatRoomName=C3xF%27s+Build+a+Prompt+Challenge%2CBuild+a+Prompt+Challenge%2CC3xF%27s%2C+%22Portraits+Build+a+Prompt%22+Challenge+`

## Impact

- `src/ChallengeLibraryManager.ts`: Deduplication logic switches from self-log to NightCafe history cache
- `src/Scrapers.ts`: `NightCafeScraper` needs real implementation to fetch and parse the challenge search page
- `src/cli.ts`: New `sync-history` command replaces or supplements `resync-challenges`
- `data/` or `~/.nightcafe-gen/`: New `nightcafe-history.json` cache file
- Existing `challenges-library.json` kept as audit log only
