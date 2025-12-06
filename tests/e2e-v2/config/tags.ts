/**
 * Test tags for filtering test runs
 *
 * Usage in tests:
 *   test('should work @smoke @critical', async () => { ... })
 *   test.describe('Feature @regression', () => { ... })
 *
 * Run tagged tests:
 *   npx playwright test --grep @smoke
 *   npx playwright test --grep @critical
 *   npx playwright test --grep "@smoke|@critical"
 *
 * Exclude tags:
 *   npx playwright test --grep-invert @slow
 */

export const Tags = {
  /** Critical path tests - must pass for releases */
  CRITICAL: '@critical',

  /** Smoke tests - quick sanity checks */
  SMOKE: '@smoke',

  /** Regression tests - full test coverage */
  REGRESSION: '@regression',

  /** Slow tests - may be skipped in CI for speed */
  SLOW: '@slow',

  /** Flaky tests - known to be unstable */
  FLAKY: '@flaky',
} as const;

export type TestTag = (typeof Tags)[keyof typeof Tags];

/**
 * Helper to combine multiple tags
 * @example tagged('should add database', Tags.SMOKE, Tags.CRITICAL)
 * // Returns: 'should add database @smoke @critical'
 */
export function tagged(title: string, ...tags: TestTag[]): string {
  return `${title} ${tags.join(' ')}`;
}
