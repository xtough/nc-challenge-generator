import { Theme, ThemesData } from './types';

export class ThemeMatcher {
  private themesData: ThemesData;

  constructor(themesData: ThemesData) {
    this.themesData = themesData;
  }

  /**
   * Get theme by name
   */
  public getTheme(name: string): Theme | undefined {
    return this.themesData.themes.find((t) => t.name.toLowerCase() === name.toLowerCase());
  }

  /**
   * Get all themes
   */
  public getAllThemes(): Theme[] {
    return this.themesData.themes;
  }

  /**
   * Get a random theme
   */
  public getRandomTheme(): Theme {
    const randomIndex = Math.floor(Math.random() * this.themesData.themes.length);
    return this.themesData.themes[randomIndex];
  }

  /**
   * Validate if a theme exists
   */
  public isValidTheme(name: string): boolean {
    return this.getTheme(name) !== undefined;
  }

  /**
   * Get all available theme names
   */
  public getThemeNames(): string[] {
    return this.themesData.themes.map((t) => t.name);
  }

  /**
   * Get category names for a theme
   */
  public getCategoryNames(theme: Theme): string[] {
    return Object.keys(theme.categories);
  }

  /**
   * Get items for a specific category in a theme
   */
  public getCategoryItems(theme: Theme, categoryName: string): string[] {
    return theme.categories[categoryName] || [];
  }

  /**
   * Verify theme coherence (all categories have items)
   */
  public isThemeValid(theme: Theme): boolean {
    const requiredCategories = ['subject', 'setting', 'mood', 'medium', 'style'];
    for (const cat of requiredCategories) {
      const items = this.getCategoryItems(theme, cat);
      if (items.length === 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get themes matching a search term
   */
  public searchThemes(query: string): Theme[] {
    const lowerQuery = query.toLowerCase();
    return this.themesData.themes.filter(
      (t) =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description?.toLowerCase().includes(lowerQuery)
    );
  }
}
