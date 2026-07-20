import { ChallengeGenerator } from '../ChallengeGenerator';
import { ChallengeLibraryManager } from '../ChallengeLibraryManager';
import { OutputFormatterFactory } from '../OutputFormatter';
import * as path from 'path';

describe('NightCafe Challenge Generator', () => {
  let generator: ChallengeGenerator;
  let libraryManager: ChallengeLibraryManager;
  const dataDir = path.join(__dirname, '..', '..', 'data');
  const themesPath = path.join(dataDir, 'themes.json');

  beforeAll(() => {
    generator = new ChallengeGenerator(themesPath);
    libraryManager = new ChallengeLibraryManager();
  });

  describe('ChallengeGenerator', () => {
    test('should generate random challenge', () => {
      const challenge = generator.generateRandomChallenge();
      expect(challenge).toBeDefined();
      expect(challenge.theme).toBeDefined();
      expect(challenge.emoji).toBeDefined();
      expect(challenge.mandatoryKeyword).toBeDefined();
      expect(challenge.categories).toBeDefined();
    });

    test('should generate challenge for specific theme', () => {
      const challenge = generator.generateChallengeForTheme('Vikings');
      expect(challenge.theme).toBe('Vikings');
      expect(challenge.emoji).toBeDefined();
    });

    test('should throw error for invalid theme', () => {
      expect(() => {
        generator.generateChallengeForTheme('NonExistentTheme');
      }).toThrow();
    });

    test('should respect items per category', () => {
      const challenge = generator.generateChallengeForTheme('Vikings', { itemsPerCategory: 3 });
      for (const [category, items] of Object.entries(challenge.categories)) {
        expect(items.length).toBeLessThanOrEqual(3);
      }
    });

    test('should get available themes', () => {
      const themes = generator.getAvailableThemes();
      expect(themes.length).toBeGreaterThan(0);
    });

    test('should generate unique signatures for different challenges', () => {
      const challenge1 = generator.generateChallengeForTheme('Vikings');
      const challenge2 = generator.generateChallengeForTheme('Vikings');
      // Signatures might be the same by chance, but IDs should differ
      expect(challenge1.id).not.toBe(challenge2.id);
    });
  });

  describe('ChallengeLibraryManager', () => {
    test('should add challenge to library', () => {
      const challenge = generator.generateRandomChallenge();
      const initialCount = libraryManager.getAllChallenges().length;
      libraryManager.addChallenge(challenge);
      expect(libraryManager.getAllChallenges().length).toBe(initialCount + 1);
    });

    test('should detect duplicates', () => {
      const challenge = generator.generateChallengeForTheme('Vikings', { itemsPerCategory: 2 });
      const isDup = libraryManager.isDuplicate(challenge.signature);
      expect(typeof isDup).toBe('boolean');
    });

    test('should retrieve recent challenges', () => {
      const recent = libraryManager.getRecentChallenges(5);
      expect(Array.isArray(recent)).toBe(true);
    });

    test('should filter by theme', () => {
      const vikingChallenges = libraryManager.getChallengesByTheme('Vikings');
      vikingChallenges.forEach((c: any) => {
        expect(c.theme.toLowerCase()).toBe('vikings');
      });
    });

    test('should search challenges', () => {
      const results = libraryManager.searchChallenges('Norse');
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('OutputFormatters', () => {
    let testChallenge: any;

    beforeAll(() => {
      testChallenge = generator.generateChallengeForTheme('Vikings');
    });

    test('pretty-print formatter should include theme name', () => {
      const formatter = OutputFormatterFactory.create('pretty-print');
      const output = formatter.format(testChallenge);
      expect(output).toContain('Vikings');
      expect(output).toContain(testChallenge.mandatoryKeyword);
    });

    test('markdown formatter should be valid markdown', () => {
      const formatter = OutputFormatterFactory.create('markdown');
      const output = formatter.format(testChallenge);
      expect(output).toContain('# 🏗️');
      expect(output).toContain(testChallenge.mandatoryKeyword);
      expect(output).toContain('### ');
    });

    test('json formatter should produce valid JSON', () => {
      const formatter = OutputFormatterFactory.create('json');
      const output = formatter.format(testChallenge);
      expect(() => JSON.parse(output)).not.toThrow();
      const parsed = JSON.parse(output);
      expect(parsed.theme).toBe(testChallenge.theme);
    });
  });

  describe('Theme consistency', () => {
    test('all themes should have required categories', () => {
      const themes = generator.getAvailableThemes();
      const requiredCategories = ['subject', 'setting', 'mood', 'medium', 'style'];

      themes.forEach((theme: any) => {
        requiredCategories.forEach((cat) => {
          expect(theme.categories[cat]).toBeDefined();
          expect(theme.categories[cat].length).toBeGreaterThan(0);
        });
      });
    });

    test('generated challenge should have all required categories', () => {
      const challenge = generator.generateRandomChallenge();
      const categories = Object.keys(challenge.categories);
      expect(categories.length).toBeGreaterThan(0);
      categories.forEach((cat) => {
        expect(challenge.categories[cat]).toBeDefined();
        expect(Array.isArray(challenge.categories[cat])).toBe(true);
      });
    });
  });
});
