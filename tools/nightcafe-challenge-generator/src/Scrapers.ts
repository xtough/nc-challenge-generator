import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { ArtistsData, Artist } from './types';

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
    'https://creator.nightcafe.studio/search/challenges?sort=challenges%2Fsort%2FstartsAtMs%3Adesc&stillJoinable=false&status=finished';

  /**
   * Fetch finished challenges from NightCafe
   * Note: This is limited by API availability
   */
  async scrapeChallenges(): Promise<any[]> {
    try {
      console.log('Fetching NightCafe challenges...');
      const response = await axios.get(this.challengesUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'NightCafe-Challenge-Generator/1.0',
        },
      });

      return this.parseChallengesFromHtml(response.data);
    } catch (error) {
      throw new Error(`Failed to fetch NightCafe challenges: ${error}`);
    }
  }

  /**
   * Parse HTML to extract challenge information
   */
  private parseChallengesFromHtml(html: string): any[] {
    // This is a placeholder - actual parsing would depend on NightCafe's HTML structure
    // In production, might use Puppeteer or Playwright for dynamic content
    console.warn(
      'Note: Challenge scraping requires HTML parsing. Consider using Puppeteer for dynamic content.'
    );
    return [];
  }
}
