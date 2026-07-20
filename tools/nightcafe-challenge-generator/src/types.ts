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

export interface Challenge {
  id: string;
  theme: string;
  emoji: string;
  mandatoryKeyword: string;
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

export interface GeneratorOptions {
  theme?: string;
  itemsPerCategory?: number;
  categoryOverrides?: Record<string, number>;
  format?: 'pretty-print' | 'markdown' | 'json' | 'all';
  output?: string;
}
