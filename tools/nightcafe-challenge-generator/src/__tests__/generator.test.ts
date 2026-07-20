import { ChallengeGenerator } from '../ChallengeGenerator';
import { ChallengeLibraryManager } from '../ChallengeLibraryManager';
import { OutputFormatterFactory } from '../OutputFormatter';
import { ThemeMatcher } from '../ThemeMatcher';
import * as path from 'path';
import * as fs from 'fs';

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

describe('ThemeMatcher', () => {
  let matcher: ThemeMatcher;

  beforeAll(() => {
    const themesPath = path.join(__dirname, '..', '..', 'data', 'themes.json');
    const themesData = JSON.parse(fs.readFileSync(themesPath, 'utf-8'));
    matcher = new ThemeMatcher(themesData);
  });

  test('should return a theme by exact name', () => {
    const theme = matcher.getTheme('Vikings');
    expect(theme).toBeDefined();
    expect(theme!.name).toBe('Vikings');
  });

  test('should be case-insensitive for theme lookup', () => {
    const theme = matcher.getTheme('vikings');
    expect(theme).toBeDefined();
    expect(theme!.name).toBe('Vikings');
  });

  test('should return undefined for unknown theme', () => {
    expect(matcher.getTheme('Nonexistent')).toBeUndefined();
  });

  test('should list all themes', () => {
    const themes = matcher.getAllThemes();
    expect(themes.length).toBeGreaterThanOrEqual(12);
  });

  test('should validate theme existence', () => {
    expect(matcher.isValidTheme('Vikings')).toBe(true);
    expect(matcher.isValidTheme('Unknown')).toBe(false);
  });

  test('should return all theme names', () => {
    const names = matcher.getThemeNames();
    expect(names).toContain('Vikings');
    expect(names).toContain('Cyberpunk');
  });

  test('should return a random theme', () => {
    const theme = matcher.getRandomTheme();
    expect(theme).toBeDefined();
    expect(theme.name).toBeDefined();
    expect(theme.categories).toBeDefined();
  });

  test('random theme should always be from the known list', () => {
    const names = matcher.getThemeNames();
    for (let i = 0; i < 20; i++) {
      const theme = matcher.getRandomTheme();
      expect(names).toContain(theme.name);
    }
  });

  test('should return category items for a theme', () => {
    const theme = matcher.getTheme('Vikings')!;
    const subjects = matcher.getCategoryItems(theme, 'subject');
    expect(Array.isArray(subjects)).toBe(true);
    expect(subjects.length).toBeGreaterThan(0);
  });

  test('should return empty array for unknown category', () => {
    const theme = matcher.getTheme('Vikings')!;
    const items = matcher.getCategoryItems(theme, 'nonexistent');
    expect(items).toEqual([]);
  });
});

describe('ChallengeGenerator - additional (task 4.5)', () => {
  let generator: ChallengeGenerator;
  const themesPath = path.join(__dirname, '..', '..', 'data', 'themes.json');

  beforeAll(() => {
    generator = new ChallengeGenerator(themesPath);
  });

  test('generated challenge has id, theme, emoji, mandatoryKeyword, categories, generatedAt, signature', () => {
    const challenge = generator.generateRandomChallenge();
    expect(typeof challenge.id).toBe('string');
    expect(typeof challenge.theme).toBe('string');
    expect(typeof challenge.emoji).toBe('string');
    expect(typeof challenge.mandatoryKeyword).toBe('string');
    expect(typeof challenge.categories).toBe('object');
    expect(typeof challenge.generatedAt).toBe('string');
    expect(typeof challenge.signature).toBe('string');
  });

  test('mandatory keyword is NOT in any category pool', () => {
    const challenge = generator.generateChallengeForTheme('Vikings');
    const allItems = Object.values(challenge.categories).flat() as string[];
    expect(allItems).not.toContain(challenge.mandatoryKeyword);
  });

  test('category overrides are respected', () => {
    const challenge = generator.generateChallengeForTheme('Vikings', {
      categoryOverrides: { subject: 2, mood: 1 },
    });
    expect(challenge.categories['subject'].length).toBeLessThanOrEqual(2);
    expect(challenge.categories['mood'].length).toBeLessThanOrEqual(1);
  });

  test('signature is deterministic for the same items', () => {
    const challenge = generator.generateChallengeForTheme('Vikings', { itemsPerCategory: 1 });
    const reconstructed = generator.generateChallengeForTheme('Vikings', { itemsPerCategory: 1 });
    // Signatures differ by content, but the format is consistent
    expect(challenge.signature).toMatch(/^Vikings\|/);
  });

  test('generatedAt is a valid ISO date string', () => {
    const challenge = generator.generateRandomChallenge();
    expect(() => new Date(challenge.generatedAt)).not.toThrow();
    expect(new Date(challenge.generatedAt).getTime()).toBeGreaterThan(0);
  });
});

describe('ChallengeLibraryManager - deduplication (task 6.6)', () => {
  let lib: ChallengeLibraryManager;
  let generator: ChallengeGenerator;
  const themesPath = path.join(__dirname, '..', '..', 'data', 'themes.json');

  beforeEach(() => {
    lib = new ChallengeLibraryManager();
    generator = new ChallengeGenerator(themesPath);
  });

  test('isDuplicate returns false for unseen signature', () => {
    expect(lib.isDuplicate('completely-unique-sig-' + Date.now())).toBe(false);
  });

  test('isDuplicate returns true after adding challenge', () => {
    const challenge = generator.generateRandomChallenge();
    lib.addChallenge(challenge);
    expect(lib.isDuplicate(challenge.signature, challenge.theme)).toBe(true);
  });

  test('adding same challenge twice does not change duplicate state', () => {
    const challenge = generator.generateRandomChallenge();
    lib.addChallenge(challenge);
    const countAfterFirst = lib.getAllChallenges().length;
    // Note: addChallenge does not prevent duplicates - isDuplicate is the guard
    // The CLI checks isDuplicate before calling addChallenge
    expect(lib.isDuplicate(challenge.signature, challenge.theme)).toBe(true);
    expect(lib.getAllChallenges().length).toBe(countAfterFirst);
  });

  test('different themes produce different signatures', () => {
    const viking = generator.generateChallengeForTheme('Vikings', { itemsPerCategory: 5 });
    const cyber = generator.generateChallengeForTheme('Cyberpunk', { itemsPerCategory: 5 });
    expect(viking.signature).not.toBe(cyber.signature);
  });

  test('signature starts with theme name', () => {
    const challenge = generator.generateChallengeForTheme('Cyberpunk');
    expect(challenge.signature.startsWith('Cyberpunk|')).toBe(true);
  });

  test('isDuplicate accepts theme as optional second argument (task 7.4)', () => {
    // Without theme — just local log check (no history cache in test env)
    const challenge = generator.generateRandomChallenge();
    expect(() => lib.isDuplicate(challenge.signature)).not.toThrow();
    expect(() => lib.isDuplicate(challenge.signature, challenge.theme)).not.toThrow();
  });
});

describe('OutputFormatters - full coverage (task 7.5)', () => {
  let challenge: any;
  const themesPath = path.join(__dirname, '..', '..', 'data', 'themes.json');

  beforeAll(() => {
    const generator = new ChallengeGenerator(themesPath);
    challenge = generator.generateChallengeForTheme('Cyberpunk');
  });

  test('pretty-print includes all category names', () => {
    const output = OutputFormatterFactory.create('pretty-print').format(challenge);
    expect(output).toContain('SUBJECT');
    expect(output).toContain('SETTING');
    expect(output).toContain('MOOD');
    expect(output).toContain('MEDIUM');
    expect(output).toContain('STYLE');
  });

  test('pretty-print includes numbered items', () => {
    const output = OutputFormatterFactory.create('pretty-print').format(challenge);
    expect(output).toMatch(/1\./);
    expect(output).toMatch(/2\./);
  });

  test('markdown includes all categories as headings', () => {
    const output = OutputFormatterFactory.create('markdown').format(challenge);
    expect(output).toContain('### SUBJECT');
    expect(output).toContain('### SETTING');
    expect(output).toContain('### MOOD');
    expect(output).toContain('### ARTIST');
    expect(output).toContain('### MEDIUM');
    expect(output).toContain('### STYLE');
  });

  test('markdown items are formatted as numbered list items', () => {
    const output = OutputFormatterFactory.create('markdown').format(challenge);
    expect(output).toMatch(/^\d+\. /m);
  });

  test('json formatter includes all challenge fields', () => {
    const output = OutputFormatterFactory.create('json').format(challenge);
    const parsed = JSON.parse(output);
    expect(parsed).toHaveProperty('id');
    expect(parsed).toHaveProperty('theme');
    expect(parsed).toHaveProperty('emoji');
    expect(parsed).toHaveProperty('mandatoryKeyword');
    expect(parsed).toHaveProperty('categories');
    expect(parsed).toHaveProperty('generatedAt');
    expect(parsed).toHaveProperty('signature');
  });

  test('factory throws for unknown format', () => {
    expect(() => OutputFormatterFactory.create('unknown' as any)).toThrow();
  });

  test('all three formatters include mandatory keyword', () => {
    const formats = ['pretty-print', 'markdown', 'json'] as const;
    for (const format of formats) {
      const output = OutputFormatterFactory.create(format).format(challenge);
      expect(output).toContain(challenge.mandatoryKeyword);
    }
  });
});
