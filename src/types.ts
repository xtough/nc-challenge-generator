// Type definitions for the NightCafe Challenge Generator

export interface Artist {
  name: string;
  aliases?: string[];
  era?: string;
  styles: string[];
  medium?: string;
  themes?: string[];
}

export interface Category {
  name: string;
  items: string[];
}

/**
 * Represents a creative challenge for the NightCafe platform.
 * 
 * The `categories` object always includes an `artist` category with exactly one artist.
 * The artist is selected based on theme-compatible styles from the artists library.
 * 
 * Standard categories:
 * - artist: Always exactly 1 item (required in every challenge)
 * - subject: Multiple items (typically 5-8 per configuration)
 * - setting: Multiple items
 * - mood: Multiple items
 * - medium: Multiple items
 * - style: Multiple items
 */
export interface Challenge {
  id: string;
  theme: string;
  emoji: string;
  mandatoryKeyword: string;
  /**
   * Challenge categories including the required artist category.
   * The artist category is always present with exactly one artist name.
   */
  categories: Record<string, string[]>;
  generatedAt: string;
  signature: string; // For deduplication
}

export interface Theme {
  name: string;
  emoji: string;
  mandatoryKeyword: string;
  description?: string;
  categories: Record<string, string[]>;
}

export interface ArtistsData {
  artists: Artist[];
  metadata: {
    total: number;
    source: string;
    lastUpdated: string;
  };
}

export interface ThemesData {
  themes: Theme[];
  metadata: {
    total: number;
    source: string;
    lastUpdated: string;
  };
}

export interface ChallengeLibrary {
  challenges: Challenge[];
  metadata: {
    total: number;
    lastGenerated: string;
  };
}

export interface NightCafeHistoryEntry {
  title: string;
  fetchedAt: string;
}

export interface NightCafeHistoryCache {
  entries: NightCafeHistoryEntry[];
  metadata: {
    total: number;
    lastSynced: string;
  };
}

export interface GeneratorOptions {
  theme?: string;
  itemsPerCategory?: number;
  categoryOverrides?: Record<string, number>;
  format?: 'pretty-print' | 'markdown' | 'json' | 'all';
  output?: string;
}
