/**
 * Scraper tests with mocked data (tasks 10.8 and 12.5)
 *
 * Network calls are mocked via jest.mock so these tests run offline.
 */

import { CheatSheetScraper, NightCafeScraper } from '../Scrapers';
import { Artist } from '../types';

// Mock axios so no real HTTP calls are made
jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('playwright', () => {
  const mockTypesenseResponse = {
    json: jest.fn(),
  };
  const mockPage = {
    goto: jest.fn(),
    waitForResponse: jest.fn().mockResolvedValue(mockTypesenseResponse),
  };
  const mockContext = {
    addCookies: jest.fn(),
    addInitScript: jest.fn(),
    newPage: jest.fn().mockResolvedValue(mockPage),
  };
  const mockBrowser = {
    newContext: jest.fn().mockResolvedValue(mockContext),
    close: jest.fn(),
  };
  return {
    chromium: {
      launch: jest.fn().mockResolvedValue(mockBrowser),
    },
    __mockBrowser: mockBrowser,
    __mockContext: mockContext,
    __mockPage: mockPage,
    __mockTypesenseResponse: mockTypesenseResponse,
  };
});

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

// Minimal HTML with __NEXT_DATA__ containing challenge objects (tasks 7.2, 7.3)
const MOCK_NEXT_DATA_HTML = `<!DOCTYPE html><html><head></head><body>
<script id="__NEXT_DATA__" type="application/json">
{"props":{"pageProps":{"searchResults":{"challenges":[
  {"title":"Vikings Build-a-Prompt Challenge","startsAtMs":1700000000000},
  {"title":"Gothic Victorian Build-a-Prompt","startsAtMs":1701000000000},
  {"title":"Cyberpunk Build-a-Prompt Challenge","startsAtMs":1702000000000}
]}}},"page":"/search/challenges"}
</script></body></html>`;

describe('NightCafeScraper (tasks 7.2, 7.3)', () => {
  let scraper: NightCafeScraper;

  beforeEach(() => {
    scraper = new NightCafeScraper();
    jest.clearAllMocks();
  });

  describe('parseChallengesFromNextData() (task 7.2)', () => {
    test('extracts titles from __NEXT_DATA__', () => {
      const entries = scraper.parseChallengesFromNextData(MOCK_NEXT_DATA_HTML);
      expect(entries.length).toBe(3);
    });

    test('entry titles match source data', () => {
      const entries = scraper.parseChallengesFromNextData(MOCK_NEXT_DATA_HTML);
      const titles = entries.map((e) => e.title);
      expect(titles).toContain('Vikings Build-a-Prompt Challenge');
      expect(titles).toContain('Gothic Victorian Build-a-Prompt');
      expect(titles).toContain('Cyberpunk Build-a-Prompt Challenge');
    });

    test('each entry has a fetchedAt ISO timestamp', () => {
      const entries = scraper.parseChallengesFromNextData(MOCK_NEXT_DATA_HTML);
      for (const e of entries) {
        expect(() => new Date(e.fetchedAt)).not.toThrow();
        expect(new Date(e.fetchedAt).getTime()).toBeGreaterThan(0);
      }
    });
  });

  describe('parseChallengesFromNextData() error cases (task 7.3)', () => {
    test('throws when __NEXT_DATA__ script tag is absent', () => {
      expect(() => scraper.parseChallengesFromNextData('<html><body></body></html>')).toThrow(
        'Could not find __NEXT_DATA__'
      );
    });

    test('throws when __NEXT_DATA__ contains malformed JSON', () => {
      const badHtml = `<script id="__NEXT_DATA__" type="application/json">not-json</script>`;
      expect(() => scraper.parseChallengesFromNextData(badHtml)).toThrow(
        'Failed to parse __NEXT_DATA__'
      );
    });

    test('throws when challenge array cannot be located in the JSON', () => {
      const emptyHtml = `<script id="__NEXT_DATA__" type="application/json">{"props":{}}</script>`;
      expect(() => scraper.parseChallengesFromNextData(emptyHtml)).toThrow(
        'Could not locate challenge list'
      );
    });
  });

  describe('scrapeChallenges() network integration', () => {
    let mockPage: any;
    let mockTypesenseResponse: any;

    beforeEach(() => {
      const pw = jest.requireMock('playwright');
      mockPage = pw.__mockPage;
      mockTypesenseResponse = pw.__mockTypesenseResponse;
      mockPage.goto.mockReset();
      mockPage.waitForResponse.mockReset();
      mockTypesenseResponse.json.mockReset();
      mockPage.waitForResponse.mockResolvedValue(mockTypesenseResponse);
    });

    test('returns parsed entries from mocked Typesense response', async () => {
      mockPage.goto.mockResolvedValue({ status: () => 200 });
      mockTypesenseResponse.json.mockResolvedValue({
        results: [{ hits: [
          { document: { title: 'Build a Prompt - Horror', startsAtMs: 1700000000000 } },
          { document: { title: 'Build a Prompt - Fantasy', startsAtMs: 1701000000000 } },
          { document: { title: 'Build a Prompt - Sci-Fi', startsAtMs: 1702000000000 } },
        ]}],
      });
      const entries = await scraper.scrapeChallenges();
      expect(entries.length).toBe(3);
    });

    test('throws descriptive error on 403', async () => {
      mockPage.goto.mockResolvedValue({ status: () => 403 });
      await expect(scraper.scrapeChallenges()).rejects.toThrow('403 Forbidden');
    });

    test('throws on generic network error', async () => {
      mockPage.goto.mockRejectedValue(new Error('timeout'));
      await expect(scraper.scrapeChallenges()).rejects.toThrow('Failed to fetch NightCafe challenges');
    });
  });
});
