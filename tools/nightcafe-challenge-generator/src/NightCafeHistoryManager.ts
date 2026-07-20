import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { NightCafeHistoryEntry, NightCafeHistoryCache } from './types';

export class NightCafeHistoryManager {
  private readonly historyPath: string;
  private cache: NightCafeHistoryCache | null = null;

  constructor() {
    const nightcafeDir = path.join(os.homedir(), '.nightcafe-gen');
    if (!fs.existsSync(nightcafeDir)) {
      fs.mkdirSync(nightcafeDir, { recursive: true });
    }
    this.historyPath = path.join(nightcafeDir, 'nightcafe-history.json');
  }

  /** Load the history cache from disk. Returns null if file does not exist. */
  private loadCache(): NightCafeHistoryCache | null {
    if (!fs.existsSync(this.historyPath)) {
      return null;
    }
    try {
      const content = fs.readFileSync(this.historyPath, 'utf-8');
      return JSON.parse(content) as NightCafeHistoryCache;
    } catch {
      process.stderr.write('Warning: Could not read NightCafe history cache — ignoring.\n');
      return null;
    }
  }

  /** Save entries to disk with updated metadata. */
  saveCache(entries: NightCafeHistoryEntry[]): void {
    const cache: NightCafeHistoryCache = {
      entries,
      metadata: {
        total: entries.length,
        lastSynced: new Date().toISOString(),
      },
    };
    fs.writeFileSync(this.historyPath, JSON.stringify(cache, null, 2), 'utf-8');
    this.cache = cache;
  }

  /** Return all cached entries, loading from disk on first access. */
  getEntries(): NightCafeHistoryEntry[] {
    if (this.cache === null) {
      this.cache = this.loadCache();
    }
    return this.cache?.entries ?? [];
  }

  /** Return true if any cached challenge title contains the theme name (case-insensitive). */
  isCachedTitle(theme: string): boolean {
    const lower = theme.toLowerCase();
    return this.getEntries().some((e) => e.title.toLowerCase().includes(lower));
  }

  /** Returns stats suitable for the `stats` command. */
  getCacheStats(): { total: number; lastSynced: string | null } {
    if (this.cache === null) {
      this.cache = this.loadCache();
    }
    if (this.cache === null) {
      return { total: 0, lastSynced: null };
    }
    return {
      total: this.cache.metadata.total,
      lastSynced: this.cache.metadata.lastSynced,
    };
  }

  /** Returns true if the cache file exists on disk. */
  cacheExists(): boolean {
    return fs.existsSync(this.historyPath);
  }
}
