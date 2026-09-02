import { describe, it, expect } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugify('Spring Equinox Music Festival')).toBe('spring-equinox-music-festival');
  });

  it('strips punctuation', () => {
    expect(slugify('Rock & Roll: Night!')).toBe('rock-roll-night');
  });

  it('collapses repeated separators and trims leading/trailing hyphens', () => {
    expect(slugify('  --Multiple   Spaces--  ')).toBe('multiple-spaces');
  });
});
