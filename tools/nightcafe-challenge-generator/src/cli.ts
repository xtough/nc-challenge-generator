#!/usr/bin/env node

import { Command } from 'commander';
import * as path from 'path';
import { ChallengeGenerator } from './ChallengeGenerator';
import { ChallengeLibraryManager } from './ChallengeLibraryManager';
import { OutputFormatterFactory } from './OutputFormatter';
import { OutputManager } from './OutputManager';
import { CheatSheetScraper, NightCafeScraper } from './Scrapers';
import { GeneratorOptions } from './types';

const program = new Command();

// Get data directory
const dataDir = path.join(__dirname, '..', 'data');
const themesPath = path.join(dataDir, 'themes.json');

// Initialize generators
const generator = new ChallengeGenerator(themesPath);
const libraryManager = new ChallengeLibraryManager();

program
  .name('nightcafe-gen')
  .description('CLI tool to generate NightCafe Build-a-Prompt challenges')
  .version('1.0.0');

/**
 * Main generate command
 */
program
  .command('generate', { isDefault: true })
  .alias('gen')
  .description('Generate a new challenge')
  .option('--theme <name>', 'Theme for the challenge (random if omitted)')
  .option('--items <number>', 'Number of items per category (default: 5)', '5')
  .option('--artists <number>', 'Number of artist suggestions (overrides --items)')
  .option('--subjects <number>', 'Number of subject suggestions (overrides --items)')
  .option('--settings <number>', 'Number of setting suggestions (overrides --items)')
  .option('--moods <number>', 'Number of mood suggestions (overrides --items)')
  .option('--mediums <number>', 'Number of medium suggestions (overrides --items)')
  .option('--styles <number>', 'Number of style suggestions (overrides --items)')
  .option('--format <type>', 'Output format: pretty-print, markdown, json, all (default: pretty-print)', 'pretty-print')
  .option('--output <file>', 'Output file path (writes to stdout if omitted)')
  .option('--no-dedupe', 'Skip deduplication check')
  .action(async (options) => {
    try {
      const opts: GeneratorOptions = {
        theme: options.theme,
        itemsPerCategory: parseInt(options.items),
        categoryOverrides: {},
        format: options.format as any,
        output: options.output,
      };

      // Parse category overrides
      if (options.artists) opts.categoryOverrides!.artist = parseInt(options.artists);
      if (options.subjects) opts.categoryOverrides!.subject = parseInt(options.subjects);
      if (options.settings) opts.categoryOverrides!.setting = parseInt(options.settings);
      if (options.moods) opts.categoryOverrides!.mood = parseInt(options.moods);
      if (options.mediums) opts.categoryOverrides!.medium = parseInt(options.mediums);
      if (options.styles) opts.categoryOverrides!.style = parseInt(options.styles);

      // Generate challenge
      const challenge = options.theme
        ? generator.generateChallengeForTheme(options.theme, opts)
        : generator.generateRandomChallenge(opts);

      // Check for duplicates
      if (options.dedupe && libraryManager.isDuplicate(challenge.signature)) {
        console.log('⚠️  Generated challenge already exists in library. Regenerating...');
        // Skip reparse and just regenerate
        return;
      }

      // Add to library
      libraryManager.addChallenge(challenge);

      // Format output
      if (options.format === 'all') {
        const prettyOutput = OutputFormatterFactory.create('pretty-print').format(challenge);
        const markdownOutput = OutputFormatterFactory.create('markdown').format(challenge);
        const jsonOutput = OutputFormatterFactory.create('json').format(challenge);

        console.log(prettyOutput);

        if (options.output) {
          const baseName = options.output.replace(/\.[^/.]+$/, '');
          OutputManager.writeToFile(`${baseName}.md`, markdownOutput);
          OutputManager.writeToFile(`${baseName}.json`, jsonOutput);
        }
      } else {
        const formatter = OutputFormatterFactory.create(options.format);
        const output = formatter.format(challenge);

        if (options.output) {
          OutputManager.writeToFile(OutputManager.resolvePath(options.output), output);
        } else {
          OutputManager.writeToStdout(output);
        }
      }

      console.log(`\n✓ Challenge added to library (Total: ${libraryManager.getAllChallenges().length})`);
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });

/**
 * List available themes
 */
program
  .command('themes')
  .description('List available themes')
  .action(() => {
    const themes = generator.getAvailableThemes();
    console.log('\n📚 Available Themes:\n');
    themes.forEach((theme) => {
      console.log(`  ${theme.emoji} ${theme.name}`);
      console.log(`     ${theme.description || 'No description'}\n`);
    });
  });

/**
 * Show challenge history
 */
program
  .command('history')
  .description('Show recently generated challenges')
  .option('--limit <number>', 'Number of recent challenges to show (default: 10)', '10')
  .option('--theme <name>', 'Filter by theme')
  .option('--search <query>', 'Search challenges')
  .option('--format <type>', 'Output format: table, json (default: table)', 'table')
  .action((options) => {
    try {
      let challenges = options.theme
        ? libraryManager.getChallengesByTheme(options.theme)
        : libraryManager.getRecentChallenges(parseInt(options.limit));

      if (options.search) {
        challenges = libraryManager.searchChallenges(options.search);
      }

      if (challenges.length === 0) {
        console.log('No challenges found.');
        return;
      }

      if (options.format === 'json') {
        console.log(JSON.stringify(challenges, null, 2));
      } else {
        console.log(`\n📖 Challenge History (${challenges.length} total):\n`);
        challenges.forEach((c, i) => {
          console.log(`${i + 1}. ${c.emoji} ${c.theme} - ${c.mandatoryKeyword}`);
          console.log(`   Generated: ${new Date(c.generatedAt).toLocaleString()}\n`);
        });
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });

/**
 * Show library statistics
 */
program
  .command('stats')
  .description('Show challenge library statistics')
  .action(() => {
    const stats = libraryManager.getStats();
    const all = libraryManager.getAllChallenges();

    console.log('\n📊 Challenge Library Statistics:\n');
    console.log(`  Total Challenges: ${stats.total}`);

    // Group by theme
    const themeStats = Object.entries(stats)
      .filter(([key]) => key.startsWith('theme_'))
      .map(([key, value]) => ({ theme: key.replace('theme_', ''), count: value }))
      .sort((a, b) => b.count - a.count);

    if (themeStats.length > 0) {
      console.log('\n  By Theme:');
      themeStats.forEach(({ theme, count }) => {
        console.log(`    ${theme}: ${count}`);
      });
    }

    if (all.length > 0) {
      const firstDate = new Date(all[0].generatedAt);
      const lastDate = new Date(all[all.length - 1].generatedAt);
      console.log(`\n  First Challenge: ${firstDate.toLocaleString()}`);
      console.log(`  Last Challenge: ${lastDate.toLocaleString()}`);
    }
    console.log();
  });

/**
 * Clear library
 */
program
  .command('clear')
  .description('Clear challenge library')
  .option('--old <days>', 'Clear only challenges older than N days')
  .option('--confirm', 'Skip confirmation prompt')
  .action((options) => {
    if (!options.confirm) {
      console.log('⚠️  This will delete your challenge library.');
      console.log('Use --confirm flag to proceed without confirmation.');
      return;
    }

    if (options.old) {
      const removed = libraryManager.clearOldChallenges(parseInt(options.old));
      console.log(`✓ Removed ${removed} challenges older than ${options.old} days.`);
    } else {
      libraryManager.clearLibrary();
      console.log('✓ Challenge library cleared.');
    }
  });

/**
 * Resync artists from cheat sheet
 */
program
  .command('resync-artists')
  .description('Update artist dataset from Stable Diffusion cheat sheet')
  .action(async () => {
    try {
      const scraper = new CheatSheetScraper();
      await scraper.resyncArtists(path.join(dataDir, 'artists.json'));
      console.log('✓ Artists synced successfully!');
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });

/**
 * Resync challenges from NightCafe
 */
program
  .command('resync-challenges')
  .description('Update challenge library from NightCafe finished challenges')
  .action(async () => {
    try {
      const scraper = new NightCafeScraper();
      const challenges = await scraper.scrapeChallenges();
      if (challenges.length > 0) {
        libraryManager.addChallenges(challenges);
        console.log(`✓ Added ${challenges.length} challenges from NightCafe!`);
      } else {
        console.log('⚠️  No challenges found or scraping not fully implemented.');
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
