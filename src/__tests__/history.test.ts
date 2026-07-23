/**
 * Tests for NightCafeHistoryManager (task 7.1)
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { NightCafeHistoryManager } from '../NightCafeHistoryManager';
import { NightCafeHistoryEntry } from '../types';

// Use a temp dir so tests don't pollute ~/.nightcafe-gen
const tmpDir = path.join(os.tmpdir(), `nc-test-${Date.now()}`);

jest.mock('os', () => ({
  ...jest.requireActual('os'),
  homedir: () => tmpDir,
}));

beforeAll(() => {
  fs.mkdirSync(path.join(tmpDir, '.nightcafe-gen'), { recursive: true });
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('NightCafeHistoryManager (task 7.1)', () => {
  let manager: NightCafeHistoryManager;

  beforeEach(() => {
    // Remove any existing cache file between tests
    const cachePath = path.join(tmpDir, '.nightcafe-gen', 'nightcafe-history.json');
    if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    manager = new NightCafeHistoryManager();
  });

  test('cacheExists returns false when no cache file', () => {
    expect(manager.cacheExists()).toBe(false);
  });

  test('getEntries returns empty array when cache absent', () => {
    expect(manager.getEntries()).toEqual([]);
  });

  test('getCacheStats returns null lastSynced when cache absent', () => {
    const stats = manager.getCacheStats();
    expect(stats.total).toBe(0);
    expect(stats.lastSynced).toBeNull();
  });

  test('saveCache persists entries and cacheExists becomes true', () => {
    const entries: NightCafeHistoryEntry[] = [
      { title: 'Vikings Build-a-Prompt', fetchedAt: new Date().toISOString() },
    ];
    manager.saveCache(entries);
    expect(manager.cacheExists()).toBe(true);
  });

  test('save/load round-trip preserves all entries', () => {
    const entries: NightCafeHistoryEntry[] = [
      { title: 'Vikings Build-a-Prompt', fetchedAt: '2026-01-01T00:00:00.000Z' },
      { title: 'Cyberpunk Build-a-Prompt', fetchedAt: '2026-02-01T00:00:00.000Z' },
    ];
    manager.saveCache(entries);
    const loaded = new NightCafeHistoryManager();
    expect(loaded.getEntries()).toEqual(entries);
  });

  test('getCacheStats returns correct total and lastSynced after save', () => {
    const entries: NightCafeHistoryEntry[] = [
      { title: 'Vikings', fetchedAt: '2026-01-01T00:00:00.000Z' },
      { title: 'Cyberpunk', fetchedAt: '2026-01-01T00:00:00.000Z' },
    ];
    manager.saveCache(entries);
    const stats = manager.getCacheStats();
    expect(stats.total).toBe(2);
    expect(stats.lastSynced).not.toBeNull();
  });

  test('isCachedTitle returns false when cache absent', () => {
    expect(manager.isCachedTitle('Vikings')).toBe(false);
  });

  test('isCachedTitle is case-insensitive', () => {
    manager.saveCache([
      { title: 'Vikings Build-a-Prompt Challenge', fetchedAt: '2026-01-01T00:00:00.000Z' },
    ]);
    expect(manager.isCachedTitle('vikings')).toBe(true);
    expect(manager.isCachedTitle('VIKINGS')).toBe(true);
    expect(manager.isCachedTitle('Vikings')).toBe(true);
  });

  test('isCachedTitle matches substring of title', () => {
    manager.saveCache([
      { title: "C3xF's Build-a-Prompt Challenge: Gothic Victorian", fetchedAt: '2026-01-01T00:00:00.000Z' },
    ]);
    expect(manager.isCachedTitle('Gothic Victorian')).toBe(true);
  });

  test('isCachedTitle returns false for unrelated theme', () => {
    manager.saveCache([
      { title: 'Vikings Build-a-Prompt', fetchedAt: '2026-01-01T00:00:00.000Z' },
    ]);
    expect(manager.isCachedTitle('Cyberpunk')).toBe(false);
  });
});
