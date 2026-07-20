import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { ArtistsData, Artist } from './types';

export class CheatSheetScraper {
  private readonly cheatSheetUrl = 'https://supagruen.github.io/StableDiffusion-CheatSheet/';

  /**
   * Fetch and parse artists from cheat sheet
   */
  async scrapeArtists(): Promise<Artist[]> {
    try {
      console.log('Fetching Stable Diffusion Cheat Sheet...');
      const response = await axios.get(this.cheatSheetUrl, {
        timeout: 10000,
      });

      const html = response.data;
      return this.parseArtistsFromHtml(html);
    } catch (error) {
      throw new Error(`Failed to fetch cheat sheet: ${error}`);
    }
  }

  /**
   * Parse HTML to extract artist names
   * This is a simplified parser - in production, use a proper HTML parser
   */
  private parseArtistsFromHtml(html: string): Artist[] {
    const artists: Artist[] = [];

    // Match ### ARTIST_NAME †? patterns
    const artistRegex = /###\s+([A-Z\s,\-().'"]+?)(\s+†)?\n/g;
    let match;

    while ((match = artistRegex.exec(html)) !== null) {
      const name = match[1].trim();

      if (name && name.length > 0) {
        const artist: Artist = {
          name,
          styles: ['digital art'], // Default style - could be enhanced
          themes: [],
        };

        artists.push(artist);
      }
    }

    return artists;
  }

  /**
   * Merge fetched artists with existing data
   */
  mergeArtists(existing: Artist[], fetched: Artist[]): Artist[] {
    const existingMap = new Map(existing.map((a) => [a.name.toLowerCase(), a]));

    // Add/update with fetched artists
    for (const artist of fetched) {
      const key = artist.name.toLowerCase();
      if (existingMap.has(key)) {
        // Preserve existing data, update if fetched has more info
        const existing = existingMap.get(key)!;
        artist.styles = existing.styles || artist.styles;
        artist.themes = existing.themes || artist.themes;
      }
      existingMap.set(key, artist);
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
