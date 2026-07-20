## 1. NightCafe History Manager

- [x] 1.1 Create `src/NightCafeHistoryManager.ts` with class skeleton and `historyPath` pointing to `~/.nightcafe-gen/nightcafe-history.json`
- [x] 1.2 Implement `loadCache()` — read and parse `nightcafe-history.json`; return empty array if file absent
- [x] 1.3 Implement `saveCache(entries)` — write cache with `lastSynced` metadata timestamp
- [x] 1.4 Implement `isCachedTitle(theme: string): boolean` — case-insensitive substring match of theme against all cached titles
- [x] 1.5 Implement `getCacheStats(): { total: number; lastSynced: string | null }` — for `stats` command output

## 2. NightCafe Scraper — Real Implementation

- [x] 2.1 In `src/Scrapers.ts`, implement `NightCafeScraper.scrapeChallenges()` — fetch the search URL with `axios.get`
- [x] 2.2 Implement `parseChallengesFromNextData(html: string)` — extract `<script id="__NEXT_DATA__">` JSON blob via regex
- [x] 2.3 Navigate the `__NEXT_DATA__` object to extract challenge titles and dates (inspect live page structure to determine path)
- [x] 2.4 Return `Array<{ title: string; fetchedAt: string }>` from the scraper
- [x] 2.5 Handle network failures and malformed JSON gracefully — throw descriptive errors, never silently return empty on success path

## 3. Deduplication Integration

- [x] 3.1 Update `ChallengeLibraryManager.isDuplicate(signature, theme)` — accept theme as second parameter
- [x] 3.2 In `isDuplicate`, instantiate/delegate to `NightCafeHistoryManager` and check `isCachedTitle(theme)` in addition to local log
- [x] 3.3 Update all call sites of `isDuplicate` in `src/cli.ts` to pass the challenge theme
- [x] 3.4 Add warning in `isDuplicate` when history cache is absent (log to stderr, do not throw)

## 4. `sync-history` CLI Subcommand

- [x] 4.1 Add `sync-history` command to `src/cli.ts` using Commander.js
- [x] 4.2 In command action: instantiate `NightCafeScraper`, call `scrapeChallenges()`
- [x] 4.3 Merge scraped results into existing cache via `NightCafeHistoryManager.saveCache(merged)`
- [x] 4.4 Print count of new vs. existing entries and the updated `lastSynced` timestamp
- [x] 4.5 Handle network/parse errors — print user-friendly message and exit non-zero

## 5. Stats Command Update

- [x] 5.1 In `src/cli.ts` stats command, instantiate `NightCafeHistoryManager` and call `getCacheStats()`
- [x] 5.2 Append history cache info to stats output: cached challenge count and last-synced timestamp
- [x] 5.3 If cache absent, print "No history cache — run `nightcafe-gen sync-history` to populate"

## 6. Types

- [x] 6.1 Add `NightCafeHistoryEntry` interface to `src/types.ts`: `{ title: string; fetchedAt: string }`
- [x] 6.2 Add `NightCafeHistoryCache` interface: `{ entries: NightCafeHistoryEntry[]; metadata: { total: number; lastSynced: string } }`

## 7. Tests

- [x] 7.1 Add `NightCafeHistoryManager` unit tests: cache absent → empty, isCachedTitle case-insensitive match, save/load round-trip
- [x] 7.2 Add scraper test: mock `__NEXT_DATA__` HTML, verify titles extracted correctly
- [x] 7.3 Add scraper test: malformed `__NEXT_DATA__` → throws descriptive error
- [x] 7.4 Update `ChallengeLibraryManager` dedup test: duplicate detected via history cache (mock `NightCafeHistoryManager`)
- [x] 7.5 Add CLI test: `isDuplicate` called with theme argument at all generate call sites

## 8. Documentation

- [x] 8.1 Update `README.md`: add `sync-history` to the command reference section
- [x] 8.2 Add note explaining the two-layer dedup model (NightCafe history + local audit log)
- [x] 8.3 Update `CHANGELOG.md` for this change
