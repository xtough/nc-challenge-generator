## Context

The existing `ChallengeLibraryManager` stores every locally-generated challenge in `~/.nightcafe-gen/challenges-library.json` and uses that log as the deduplication source. The `NightCafeScraper` class exists as a stub that returns an empty array — it was never wired to real deduplication.

The actual source of previously-run challenges is the NightCafe challenge search page filtered to the specific Build-a-Prompt rooms:

```
https://creator.nightcafe.studio/search/challenges?sort=challenges%2Fsort%2FstartsAtMs%3Adesc
  &stillJoinable=false&status=finished
  &chatRoomName=C3xF%27s+Build+a+Prompt+Challenge%2CBuild+a+Prompt+Challenge%2C...
```

The page is a client-rendered React app. The challenge data is embedded in a `__NEXT_DATA__` JSON blob in the initial HTML response, making it parseable without a headless browser.

## Goals / Non-Goals

**Goals:**
- Fetch and cache past NightCafe challenge titles from the search URL
- Use the cache as the deduplication source (instead of the local generation log)
- Provide a `sync-history` CLI subcommand to refresh the cache on demand
- Keep `challenges-library.json` as a local audit trail (not for dedup)

**Non-Goals:**
- Pagination beyond the first page of results (can be added later)
- Authentication or scraping challenge content/images
- Real-time dedup against live NightCafe data (cache-only)
- Replacing the generation log entirely

## Decisions

### D1: Parse `__NEXT_DATA__` from the initial HTML, not a headless browser

**Decision:** Use `axios.get` + regex/JSON parse on the `__NEXT_DATA__` script tag.

**Rationale:** The NightCafe search page embeds server-side data in a `<script id="__NEXT_DATA__">` JSON block that is present in the initial HTTP response. This avoids a Puppeteer/Playwright dependency (heavy, requires a browser binary) and keeps the tool lightweight.

**Alternative considered:** Puppeteer — rejected because it requires a Chrome binary and adds ~200MB to the install footprint.

**Risk:** If NightCafe removes the SSR data payload and moves entirely to client-side fetching, the scraper breaks. Mitigation: fail gracefully and fall back to the existing cache.

---

### D2: Dedup by normalized challenge title, not by full category set

**Decision:** A NightCafe challenge is identified by its title (e.g., "Vikings Build-a-Prompt"). Dedup checks if the generated challenge's theme matches any cached title (case-insensitive substring match).

**Rationale:** We can't parse the exact category items from past NightCafe challenges (not exposed in search results). The title contains the theme name, which is the meaningful dedup signal — running "Vikings" twice is what we want to avoid.

**Alternative considered:** Signature-based match using category items — impossible without challenge detail pages.

---

### D3: Separate cache file `nightcafe-history.json` in `~/.nightcafe-gen/`

**Decision:** Store the NightCafe history cache in a dedicated file, separate from `challenges-library.json`.

**Rationale:** The two data sets have different semantics (external history vs. local audit log) and different update cadences. Mixing them makes the audit log harder to reason about.

---

### D4: `sync-history` is an explicit subcommand, not automatic

**Decision:** The cache is only updated when the user runs `nightcafe-gen sync-history`. Generation itself never triggers a network call.

**Rationale:** Keeps generation fast (<100ms) and predictable. Network calls during generation would introduce latency and failure modes. Users run `sync-history` when they want fresh data.

---

### D5: `NightCafeHistoryManager` is a new class; `ChallengeLibraryManager` delegates to it

**Decision:** Extract history-based dedup into `NightCafeHistoryManager`. `ChallengeLibraryManager.isDuplicate()` checks both the local log AND the history cache.

**Rationale:** Single-responsibility; the history manager owns fetch + cache + lookup. Keeps `ChallengeLibraryManager` unchanged except for the delegation call.

## Risks / Trade-offs

- **`__NEXT_DATA__` schema changes** → Mitigation: wrap parse in try/catch, log warning, fall back to empty history (non-blocking)
- **Rate limiting / IP blocking** → Mitigation: `sync-history` is user-initiated, not automated; add a `User-Agent` header identifying the tool
- **Title matching is fuzzy** → Mitigation: exact theme-name match (case-insensitive) on the challenge title is precise enough for the known challenge naming convention ("Vikings Build-a-Prompt Challenge")
- **History cache grows stale** → Mitigation: show last-synced timestamp in `stats` output; encourage periodic `sync-history`

## Migration Plan

1. Add `NightCafeHistoryManager` (new file) — no breaking changes
2. Update `ChallengeLibraryManager.isDuplicate()` to also check history cache — backwards-compatible (just stricter dedup)
3. Add `sync-history` CLI subcommand
4. Update `stats` command to show history cache info
5. No data migration needed — `nightcafe-history.json` is created on first `sync-history` run
