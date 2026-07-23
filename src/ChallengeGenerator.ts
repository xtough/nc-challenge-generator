import * as fs from 'fs';
import * as path from 'path';
import { Challenge, Theme, ThemesData, GeneratorOptions, Artist, ArtistsData } from './types';
import { ThemeMatcher } from './ThemeMatcher';

export class ChallengeGenerator {
  private themesData: ThemesData;
  private artistsData: ArtistsData;
  private themeMatcher: ThemeMatcher;

  constructor(themesPath: string, artistsPath?: string) {
    const themesContent = fs.readFileSync(themesPath, 'utf-8');
    this.themesData = JSON.parse(themesContent);
    this.themeMatcher = new ThemeMatcher(this.themesData);

    // Load artists data from path relative to themes.json or provided path
    const resolvedArtistsPath = artistsPath || path.join(path.dirname(themesPath), 'artists.json');
    const artistsContent = fs.readFileSync(resolvedArtistsPath, 'utf-8');
    this.artistsData = JSON.parse(artistsContent);
  }

  /**
   * Generate a challenge with a random theme
   */
  public generateRandomChallenge(options: GeneratorOptions = {}): Challenge {
    const randomTheme = this.getRandomTheme();
    return this.generateChallengeForTheme(randomTheme.name, options);
  }

  /**
   * Generate a challenge for a specific theme
   */
  public generateChallengeForTheme(themeName: string, options: GeneratorOptions = {}): Challenge {
    const theme = this.getTheme(themeName);
    if (!theme) {
      throw new Error(`Theme "${themeName}" not found. Available themes: ${this.getThemeNames().join(', ')}`);
    }

    const itemsPerCategory = options.itemsPerCategory || 5;
    const categoryOverrides = options.categoryOverrides || {};

    // Build challenge categories
    const categories: Record<string, string[]> = {};

    for (const [categoryName, categoryItems] of Object.entries(theme.categories)) {
      if (categoryName === 'artist') {
        const count = categoryOverrides[categoryName] !== undefined ? categoryOverrides[categoryName] : itemsPerCategory;
        categories[categoryName] = this.selectArtistsForTheme(theme, count).map(a => a.name);
      } else {
        const count = categoryOverrides[categoryName] !== undefined ? categoryOverrides[categoryName] : itemsPerCategory;
        categories[categoryName] = this.selectRandomItems(categoryItems, count);
      }
    }

    // If theme doesn't have artist category yet (backward compat), add it
    if (!categories['artist']) {
      categories['artist'] = this.selectArtistsForTheme(theme, itemsPerCategory).map(a => a.name);
    }

    // Generate unique ID and signature
    const id = this.generateId();
    const signature = this.generateSignature(themeName, categories);

    const challenge: Challenge = {
      id,
      theme: theme.name,
      emoji: theme.emoji,
      mandatoryKeyword: theme.mandatoryKeyword,
      categories,
      generatedAt: new Date().toISOString(),
      signature,
    };

    return challenge;
  }

  /**
   * Get all available themes
   */
  public getAvailableThemes(): Theme[] {
    return this.themesData.themes;
  }

  /**
   * Get theme names
   */
  public getThemeNames(): string[] {
    return this.themesData.themes.map((t) => t.name);
  }

  /**
   * Get a specific theme by name
   */
  public getTheme(name: string): Theme | undefined {
    return this.themesData.themes.find((t) => t.name.toLowerCase() === name.toLowerCase());
  }

  /**
   * Get a random theme
   */
  public getRandomTheme(): Theme {
    const randomIndex = Math.floor(Math.random() * this.themesData.themes.length);
    return this.themesData.themes[randomIndex];
  }

  /**
   * Select an artist for a theme, filtered by theme-compatible styles
   */
  private selectArtistsForTheme(theme: Theme, count: number): Artist[] {
    const themeStyles = theme.categories['style'] || [];
    const themeStyleSet = new Set(themeStyles.map(s => s.toLowerCase()));

    const compatibleArtists = this.artistsData.artists.filter(artist => {
      const artistThemes = (artist.themes || []).map(t => t.toLowerCase());
      const artistEra = (artist.era || '').toLowerCase();
      return themeStyleSet.has(artistEra) ||
             artistThemes.some(t => themeStyleSet.has(t)) ||
             themeStyleSet.has(artist.name.toLowerCase());
    });

    const selectedPool = compatibleArtists.length > 0 ? compatibleArtists : this.artistsData.artists;
    const poolNames = selectedPool.map(a => a.name);
    return this.selectRandomItems(poolNames, count).map(name => selectedPool.find(a => a.name === name)!);
  }

  /**
   * Select N random items from an array
   */
  private selectRandomItems(items: string[], count: number): string[] {
    if (count >= items.length) {
      return [...items];
    }

    const selected: string[] = [];
    const indices = new Set<number>();

    while (indices.size < count) {
      const randomIndex = Math.floor(Math.random() * items.length);
      if (!indices.has(randomIndex)) {
        indices.add(randomIndex);
        selected.push(items[randomIndex]);
      }
    }

    return selected;
  }

  /**
   * Generate a unique ID for the challenge
   */
  private generateId(): string {
    return `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a signature for deduplication
   * Signature = theme + sorted(category items)
   */
  public generateSignature(themeName: string, categories: Record<string, string[]>): string {
    const categoryStrings = Object.entries(categories)
      .map(([name, items]) => `${name}:${items.sort().join(',')}`)
      .sort()
      .join('|');

    return `${themeName}|${categoryStrings}`;
  }

  /**
   * Check if a challenge matches a signature
   */
  public isDuplicate(challenge: Challenge, signature: string): boolean {
    return challenge.signature === signature;
  }
}
