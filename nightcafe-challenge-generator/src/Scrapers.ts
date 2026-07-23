import axios from 'axios';
import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { ArtistsData, Artist, NightCafeHistoryEntry } from './types';

export class CheatSheetScraper {
  private readonly cheatSheetUrl = 'https://supagruen.github.io/StableDiffusion-CheatSheet/';
  private readonly cheatSheetDataUrl = 'https://supagruen.github.io/StableDiffusion-CheatSheet/src/data.js';

  /**
   * Fetch and parse artists from cheat sheet
   */
  async scrapeArtists(): Promise<Artist[]> {
    try {
      console.log('Fetching Stable Diffusion Cheat Sheet data...');
      const response = await axios.get(this.cheatSheetDataUrl, {
        timeout: 15000,
      });

      return this.parseArtistsFromDataJs(response.data);
    } catch (error) {
      throw new Error(`Failed to fetch cheat sheet: ${error}`);
    }
  }

  /**
   * Parse the data.js JavaScript array to extract artist records.
   * The file assigns a JSON array to `var data = [...]` using JS string escaping.
   */
  private parseArtistsFromDataJs(js: string): Artist[] {
    // Extract the JSON array from `var data = [...]`
    const match = js.match(/var\s+data\s*=\s*(\[[\s\S]*?\]);/);
    if (!match) {
      throw new Error('Could not find data array in cheat sheet data.js');
    }

    // The file uses JS string escaping (e.g. \') not valid in JSON - sanitize first
    const sanitized = match[1].replace(/\\'/g, "'");

    const records: Array<{
      Name: string;
      Category: string;
      Born?: string;
      Death?: string;
    }> = JSON.parse(sanitized);

    return records
      .filter((r) => r.Name && r.Name.trim().length > 0)
      .map((r) => {
        const categories = (r.Category || '')
          .split(',')
          .map((c: string) => c.trim().toLowerCase())
          .filter((c: string) => c.length > 0);

        const era = r.Born ? `b.${r.Born}` : undefined;

        return {
          name: r.Name.trim(),
          styles: categories,
          themes: [],
          ...(era ? { era } : {}),
        };
      });
  }

  /**
   * Merge fetched artists with existing data, deduplicating by name (case-insensitive).
   * Existing styles and themes are always preserved; fetched data only adds new artists.
   */
  mergeArtists(existing: Artist[], fetched: Artist[]): Artist[] {
    const existingMap = new Map(existing.map((a) => [a.name.toLowerCase(), a]));

    for (const artist of fetched) {
      const key = artist.name.toLowerCase();
      if (!existingMap.has(key)) {
        // Only add truly new artists; never overwrite existing curated data
        existingMap.set(key, artist);
      }
    }

    return Array.from(existingMap.values());
  }

  /**
   * Save artists to file
   */
  saveArtists(artists: Artist[], filePath: string): void {
    const data: ArtistsData = {
      artists,
      metadata: {
        total: artists.length,
        source: 'Stable Diffusion 1.5 Cheat Sheet',
        lastUpdated: new Date().toISOString(),
      },
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✓ Saved ${artists.length} artists to ${filePath}`);
  }

  /**
   * Full resync operation
   */
  async resyncArtists(artistsPath: string): Promise<void> {
    try {
      // Load existing artists
      let existing: Artist[] = [];
      if (fs.existsSync(artistsPath)) {
        const content = fs.readFileSync(artistsPath, 'utf-8');
        const data = JSON.parse(content) as ArtistsData;
        existing = data.artists;
      }

      // Fetch new artists
      const fetched = await this.scrapeArtists();
      console.log(`Fetched ${fetched.length} artists from cheat sheet`);

      // Merge
      const merged = this.mergeArtists(existing, fetched);
      console.log(`Merged to ${merged.length} total artists`);

      // Save
      this.saveArtists(merged, artistsPath);
    } catch (error) {
      throw new Error(`Resync failed: ${error}`);
    }
  }
}

export class NightCafeScraper {
  private readonly challengesUrl =
    'https://creator.nightcafe.studio/search/challenges?sort=challenges%2Fsort%2FstartsAtMs%3Adesc&stillJoinable=false&status=finished&chatRoomName=C3xF%27s+Build+a+Prompt+Challenge%2CBuild+a+Prompt+Challenge%2CC3xF%27s%2C+%22Portraits+Build+a+Prompt%22+Challenge+';

  /**
   * Fetch finished Build-a-Prompt challenges from NightCafe using a headless Chromium browser.
   * Uses a real browser TLS fingerprint to bypass Cloudflare bot protection.
   * Set NIGHTCAFE_COOKIE to your browser session cookie to authenticate.
   */
  async scrapeChallenges(): Promise<NightCafeHistoryEntry[]> {
    const cookieHeader = process.env.NIGHTCAFE_COOKIE;

    const browser = await chromium.launch({
      headless: true,
      args: ['--disable-blink-features=AutomationControlled'],
    });
    try {
      const context = await browser.newContext({
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
      });
      await context.addInitScript('Object.defineProperty(navigator, "webdriver", { get: () => undefined })');

      if (cookieHeader) {
        const cookies = cookieHeader.split(';').map((pair: string) => {
          const eqIdx = pair.indexOf('=');
          return {
            name: pair.slice(0, eqIdx).trim(),
            value: pair.slice(eqIdx + 1).trim(),
            domain: 'creator.nightcafe.studio',
            path: '/',
          };
        });
        await context.addCookies(cookies);
      }

      const page = await context.newPage();
      console.log('Fetching NightCafe challenge history...');

      const response = await page.goto(this.challengesUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

      if (response?.status() === 403) {
        throw new Error(
          'NightCafe returned 403 Forbidden (Cloudflare bot protection).\n' +
            'Set the NIGHTCAFE_COOKIE environment variable to your browser session cookie:\n' +
            '  $env:NIGHTCAFE_COOKIE = Get-Content data/cookie.txt -Raw\n' +
            '  npm run dev -- sync-history'
        );
      }

      const html = await page.content();
      return this.parseChallengesFromNextData(html);
    } catch (error: any) {
      if (error.message.includes('403 Forbidden')) throw error;
      throw new Error(`Failed to fetch NightCafe challenges: ${error}`);
    } finally {
      await browser.close();
    }
  }

  /**
   * Extract challenge entries from the __NEXT_DATA__ JSON blob embedded in the page HTML.
   * Next.js embeds server-side props in <script id="__NEXT_DATA__">...</script>.
   */
  parseChallengesFromNextData(html: string): NightCafeHistoryEntry[] {
    const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (!match) {
      throw new Error(
        'Could not find __NEXT_DATA__ in NightCafe page response. ' +
          'The page structure may have changed — please open an issue.'
      );
    }

    let nextData: any;
    try {
      nextData = JSON.parse(match[1]);
    } catch {
      throw new Error('Failed to parse __NEXT_DATA__ JSON from NightCafe page.');
    }

    // Navigate: props.pageProps.initialState.entities.challenges (or similar path)
    // We search recursively for an array of objects that each have a "title" string field
    const challenges = this.findChallengeArray(nextData);
    if (!challenges) {
      throw new Error(
        'Could not locate challenge list in __NEXT_DATA__. ' +
          'The page structure may have changed.'
      );
    }

    const fetchedAt = new Date().toISOString();
    return challenges
      .filter((c: any) => typeof c.title === 'string' && c.title.trim().length > 0)
      .map((c: any) => ({ title: c.title.trim(), fetchedAt }));
  }

  /**
   * Recursively search for the first array whose items look like challenge objects
   * (have a string "title" field). Handles varying __NEXT_DATA__ shapes across
   * Next.js versions and app updates.
   */
  private findChallengeArray(obj: any, depth = 0): any[] | null {
    if (depth > 10 || obj === null || typeof obj !== 'object') return null;

    if (Array.isArray(obj)) {
      if (obj.length > 0 && typeof obj[0]?.title === 'string') return obj;
      for (const item of obj) {
        const found = this.findChallengeArray(item, depth + 1);
        if (found) return found;
      }
      return null;
    }

    for (const key of Object.keys(obj)) {
      const found = this.findChallengeArray(obj[key], depth + 1);
      if (found) return found;
    }
    return null;
  }
}
