/**
 * Scraper tests with mocked data (tasks 10.8 and 12.5)
 *
 * Network calls are mocked via jest.mock so these tests run offline.
 */

import { CheatSheetScraper } from '../Scrapers';
import { Artist } from '../types';

// Mock axios so no real HTTP calls are made
jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Minimal data.js content that matches the parser's expected format
const MOCK_CHEAT_SHEET_HTML = `var data = [{"Type":"1","Name":"Vincent van Gogh","Born":"1853","Death":"1890","Prompt":"style of Vincent van Gogh","NPrompt":"","Category":"Painting, Oil, Post-Impressionism, Netherlands, 19th Century","Checkpoint":"Deliberate 2.0","Extrainfo":"","Image":"Vincent-van-Gogh.webp","Creation":"202304061553"},{"Type":"1","Name":"Frida Kahlo","Born":"1907","Death":"1954","Prompt":"style of Frida Kahlo","NPrompt":"","Category":"Painting, Oil, Folk Art, Surrealism, Mexico","Checkpoint":"Deliberate 2.0","Extrainfo":"","Image":"Frida-Kahlo.webp","Creation":"202304062000"},{"Type":"1","Name":"H.R. Giger","Born":"1940","Death":"2014","Prompt":"style of H.R. Giger","NPrompt":"","Category":"Surrealism, Sci-Fi, Horror, Switzerland","Checkpoint":"Deliberate 2.0","Extrainfo":"","Image":"HR-Giger.webp","Creation":"202304062100"},{"Type":"1","Name":"Greg Rutkowski","Born":"1985","Death":"","Prompt":"style of Greg Rutkowski","NPrompt":"","Category":"Illustration, Fantasy, Poland","Checkpoint":"Deliberate 2.0","Extrainfo":"","Image":"Greg-Rutkowski.webp","Creation":"202304062200"}];`;

describe('CheatSheetScraper (tasks 10.8, 12.5)', () => {
  let scraper: CheatSheetScraper;

  beforeEach(() => {
    scraper = new CheatSheetScraper();
    jest.clearAllMocks();
  });

  describe('scrapeArtists()', () => {
    test('parses artists from valid HTML response', async () => {
      mockedAxios.get = jest.fn().mockResolvedValue({ data: MOCK_CHEAT_SHEET_HTML });

      const artists = await scraper.scrapeArtists();

      expect(Array.isArray(artists)).toBe(true);
      expect(artists.length).toBeGreaterThan(0);
    });

    test('returned artists have required fields', async () => {
      mockedAxios.get = jest.fn().mockResolvedValue({ data: MOCK_CHEAT_SHEET_HTML });

      const artists = await scraper.scrapeArtists();

      for (const artist of artists) {
        expect(typeof artist.name).toBe('string');
        expect(artist.name.length).toBeGreaterThan(0);
        expect(Array.isArray(artist.styles)).toBe(true);
        expect(Array.isArray(artist.themes)).toBe(true);
      }
    });

    test('throws when HTTP request fails', async () => {
      mockedAxios.get = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(scraper.scrapeArtists()).rejects.toThrow('Failed to fetch cheat sheet');
    });

    test('handles missing data array in response by throwing', async () => {
      mockedAxios.get = jest.fn().mockResolvedValue({ data: '<html></html>' });

      await expect(scraper.scrapeArtists()).rejects.toThrow('Failed to fetch cheat sheet');
    });
  });

  describe('mergeArtists() deduplication (task 10.7)', () => {
    const existingArtists: Artist[] = [
      { name: 'Vincent van Gogh', styles: ['post-impressionism', 'oil painting'], themes: ['nature'] },
      { name: 'Frida Kahlo', styles: ['surrealism', 'folk art'], themes: ['portraits'] },
    ];

    test('preserves all existing artists', () => {
      const merged = scraper.mergeArtists(existingArtists, []);
      expect(merged.length).toBe(existingArtists.length);
    });

    test('adds new artists from fetched list', () => {
      const fetched: Artist[] = [
        { name: 'New Artist', styles: ['digital art'], themes: [] },
      ];
      const merged = scraper.mergeArtists(existingArtists, fetched);
      expect(merged.length).toBe(existingArtists.length + 1);
    });

    test('deduplicates by name (case-insensitive)', () => {
      const fetched: Artist[] = [
        { name: 'VINCENT VAN GOGH', styles: ['digital art'], themes: [] },
      ];
      const merged = scraper.mergeArtists(existingArtists, fetched);
      // Should not add a duplicate - count stays the same
      expect(merged.length).toBe(existingArtists.length);
    });

    test('preserves existing styles when deduplicating', () => {
      const fetched: Artist[] = [
        { name: 'Frida Kahlo', styles: ['digital art'], themes: [] },
      ];
      const merged = scraper.mergeArtists(existingArtists, fetched);
      const kahlo = merged.find((a) => a.name.toLowerCase() === 'frida kahlo')!;
      // Existing styles should be preserved
      expect(kahlo.styles).toContain('surrealism');
    });

    test('preserves existing themes when deduplicating', () => {
      const fetched: Artist[] = [
        { name: 'Frida Kahlo', styles: ['digital art'], themes: ['cyberpunk'] },
      ];
      const merged = scraper.mergeArtists(existingArtists, fetched);
      const kahlo = merged.find((a) => a.name.toLowerCase() === 'frida kahlo')!;
      expect(kahlo.themes).toContain('portraits');
    });

    test('handles empty existing list', () => {
      const fetched: Artist[] = [
        { name: 'New Artist', styles: ['oil painting'], themes: [] },
      ];
      const merged = scraper.mergeArtists([], fetched);
      expect(merged.length).toBe(1);
    });

    test('handles empty fetched list', () => {
      const merged = scraper.mergeArtists(existingArtists, []);
      expect(merged.length).toBe(existingArtists.length);
    });
  });
});
