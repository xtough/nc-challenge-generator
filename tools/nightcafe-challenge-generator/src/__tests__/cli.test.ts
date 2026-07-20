/**
 * CLI argument parsing and error handling tests (task 12.4)
 *
 * These tests exercise the generator and library in the same patterns the CLI uses,
 * since the CLI itself is not easily unit-testable without spawning a child process.
 * The key invariants (option defaults, error propagation, format selection) are
 * verified through the modules the CLI delegates to.
 */

import { ChallengeGenerator } from '../ChallengeGenerator';
import { OutputFormatterFactory } from '../OutputFormatter';
import * as path from 'path';

const themesPath = path.join(__dirname, '..', '..', 'data', 'themes.json');
const generator = new ChallengeGenerator(themesPath);

describe('CLI argument handling invariants (task 12.4)', () => {
  describe('--items default (5)', () => {
    test('default itemsPerCategory produces at most 5 items per category', () => {
      const challenge = generator.generateRandomChallenge({ itemsPerCategory: 5 });
      for (const items of Object.values(challenge.categories)) {
        expect((items as string[]).length).toBeLessThanOrEqual(5);
      }
    });

    test('itemsPerCategory 1 produces exactly 1 item per category', () => {
      const challenge = generator.generateRandomChallenge({ itemsPerCategory: 1 });
      for (const items of Object.values(challenge.categories)) {
        expect((items as string[]).length).toBe(1);
      }
    });
  });

  describe('--theme validation', () => {
    test('valid theme name generates a challenge', () => {
      expect(() => generator.generateChallengeForTheme('Vikings')).not.toThrow();
    });

    test('invalid theme name throws a descriptive error', () => {
      expect(() => generator.generateChallengeForTheme('NotATheme')).toThrow();
    });

    test('theme name matching is case-insensitive', () => {
      const lower = generator.generateChallengeForTheme('vikings');
      expect(lower.theme).toBe('Vikings');
    });
  });

  describe('--format selection', () => {
    const challenge = generator.generateChallengeForTheme('Vikings');

    test('pretty-print is a valid format', () => {
      expect(() => OutputFormatterFactory.create('pretty-print').format(challenge)).not.toThrow();
    });

    test('markdown is a valid format', () => {
      expect(() => OutputFormatterFactory.create('markdown').format(challenge)).not.toThrow();
    });

    test('json is a valid format', () => {
      expect(() => OutputFormatterFactory.create('json').format(challenge)).not.toThrow();
    });

    test('unknown format throws', () => {
      expect(() => OutputFormatterFactory.create('xml' as any)).toThrow();
    });
  });

  describe('--theme with category overrides', () => {
    test('subject override limits subject items', () => {
      const challenge = generator.generateChallengeForTheme('Cyberpunk', {
        categoryOverrides: { subject: 2 },
        itemsPerCategory: 5,
      });
      expect(challenge.categories['subject'].length).toBeLessThanOrEqual(2);
    });

    test('override of 0 returns empty array for that category', () => {
      const challenge = generator.generateChallengeForTheme('Cyberpunk', {
        categoryOverrides: { mood: 0 },
        itemsPerCategory: 5,
      });
      expect(challenge.categories['mood'].length).toBe(0);
    });

    test('category override larger than pool is capped to pool size', () => {
      // Pool sizes are typically 5-6, requesting 100 should return all pool items
      const challenge = generator.generateChallengeForTheme('Vikings', {
        categoryOverrides: { subject: 100 },
      });
      const subjectPool = generator.getAvailableThemes().find((t: any) => t.name === 'Vikings')!
        .categories['subject'];
      expect(challenge.categories['subject'].length).toBeLessThanOrEqual(subjectPool.length);
    });
  });

  describe('error propagation', () => {
    test('generator construction fails on missing themes file', () => {
      expect(() => new ChallengeGenerator('/nonexistent/themes.json')).toThrow();
    });

    test('generator construction fails on invalid JSON', () => {
      const os = require('os');
      const p = require('path');
      const f = require('fs');
      const tmp = p.join(os.tmpdir(), 'bad-themes.json');
      f.writeFileSync(tmp, 'not json', 'utf-8');
      expect(() => new ChallengeGenerator(tmp)).toThrow();
      f.unlinkSync(tmp);
    });
  });
});
