import { describe, expect, it } from 'vitest';
import { shouldDockNavigation } from '@/lib/portfolio-navigation';

describe('portfolio navigation', () => {
  it('moves navigation to the bottom after scrolling and restores it at the top', () => {
    expect(shouldDockNavigation(0)).toBe(false);
    expect(shouldDockNavigation(101)).toBe(true);
    expect(shouldDockNavigation(1200)).toBe(true);
    expect(shouldDockNavigation(0)).toBe(false);
  });
});