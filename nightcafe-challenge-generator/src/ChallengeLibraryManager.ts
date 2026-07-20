import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Challenge, ChallengeLibrary } from './types';
import { NightCafeHistoryManager } from './NightCafeHistoryManager';

export class ChallengeLibraryManager {
  private libraryPath: string;
  private library: ChallengeLibrary;

  constructor() {
    // Use ~/.nightcafe-gen/ directory
    const homeDir = os.homedir();
    const nightcafeDir = path.join(homeDir, '.nightcafe-gen');

    // Create directory if it doesn't exist
    if (!fs.existsSync(nightcafeDir)) {
      fs.mkdirSync(nightcafeDir, { recursive: true });
    }

    this.libraryPath = path.join(nightcafeDir, 'challenges-library.json');
    this.library = this.loadLibrary();
  }

  /**
   * Load library from disk
   */
  private loadLibrary(): ChallengeLibrary {
    try {
      if (fs.existsSync(this.libraryPath)) {
        const content = fs.readFileSync(this.libraryPath, 'utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn('Warning: Could not load challenge library, starting fresh');
    }

    return {
      challenges: [],
      metadata: {
        total: 0,
        lastGenerated: new Date().toISOString(),
      },
    };
  }

  /**
   * Save library to disk
   */
  private saveLibrary(): void {
    try {
      fs.writeFileSync(this.libraryPath, JSON.stringify(this.library, null, 2), 'utf-8');
    } catch (error) {
      throw new Error(`Failed to save challenge library: ${error}`);
    }
  }

  /**
   * Add a challenge to the library
   */
  public addChallenge(challenge: Challenge): void {
    this.library.challenges.push(challenge);
    this.library.metadata.total = this.library.challenges.length;
    this.library.metadata.lastGenerated = new Date().toISOString();
    this.saveLibrary();
  }

  /**
   * Check if a challenge is a duplicate.
   * Checks both the local audit log (by signature) and the NightCafe history cache (by theme name).
   * Emits a warning to stderr if the history cache is absent.
   */
  public isDuplicate(signature: string, theme?: string): boolean {
    // Check local audit log
    const inLog = this.library.challenges.some((c) => c.signature === signature);
    if (inLog) return true;

    // Check NightCafe history cache
    if (theme !== undefined) {
      const historyManager = new NightCafeHistoryManager();
      if (!historyManager.cacheExists()) {
        process.stderr.write(
          'ℹ️  No NightCafe history cache found. Run `nightcafe-gen sync-history` to enable history-based deduplication.\n'
        );
      } else if (historyManager.isCachedTitle(theme)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get all challenges
   */
  public getAllChallenges(): Challenge[] {
    return this.library.challenges;
  }

  /**
   * Get challenges by theme
   */
  public getChallengesByTheme(theme: string): Challenge[] {
    return this.library.challenges.filter((c) => c.theme.toLowerCase() === theme.toLowerCase());
  }

  /**
   * Get the last N challenges
   */
  public getRecentChallenges(limit: number = 10): Challenge[] {
    return this.library.challenges.slice(-limit).reverse();
  }

  /**
   * Search challenges
   */
  public searchChallenges(query: string): Challenge[] {
    const lowerQuery = query.toLowerCase();
    return this.library.challenges.filter(
      (c) =>
        c.theme.toLowerCase().includes(lowerQuery) ||
        c.mandatoryKeyword.toLowerCase().includes(lowerQuery) ||
        Object.values(c.categories).some((items) =>
          items.some((item) => item.toLowerCase().includes(lowerQuery))
        )
    );
  }

  /**
   * Clear old challenges (older than N days)
   */
  public clearOldChallenges(daysOld: number): number {
    const now = Date.now();
    const cutoff = now - daysOld * 24 * 60 * 60 * 1000;

    const originalCount = this.library.challenges.length;
    this.library.challenges = this.library.challenges.filter((c) => {
      const challengeTime = new Date(c.generatedAt).getTime();
      return challengeTime > cutoff;
    });

    const removed = originalCount - this.library.challenges.length;
    this.library.metadata.total = this.library.challenges.length;

    if (removed > 0) {
      this.saveLibrary();
    }

    return removed;
  }

  /**
   * Clear entire library
   */
  public clearLibrary(): void {
    this.library = {
      challenges: [],
      metadata: {
        total: 0,
        lastGenerated: new Date().toISOString(),
      },
    };
    this.saveLibrary();
  }

  /**
   * Add challenges from an array (for bulk import)
   */
  public addChallenges(challenges: Challenge[]): void {
    this.library.challenges.push(...challenges);
    this.library.metadata.total = this.library.challenges.length;
    this.library.metadata.lastGenerated = new Date().toISOString();
    this.saveLibrary();
  }

  /**
   * Get library statistics
   */
  public getStats(): Record<string, number> {
    const stats: Record<string, number> = {
      total: this.library.challenges.length,
    };

    // Count by theme
    const themeCount: Record<string, number> = {};
    for (const challenge of this.library.challenges) {
      themeCount[challenge.theme] = (themeCount[challenge.theme] || 0) + 1;
    }

    for (const [theme, count] of Object.entries(themeCount)) {
      stats[`theme_${theme}`] = count;
    }

    return stats;
  }

  /**
   * Export library as JSON
   */
  public export(): ChallengeLibrary {
    return JSON.parse(JSON.stringify(this.library));
  }

  /**
   * Import library from JSON
   */
  public import(data: ChallengeLibrary): void {
    this.library = data;
    this.saveLibrary();
  }
}
