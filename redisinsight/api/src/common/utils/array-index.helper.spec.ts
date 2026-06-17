import {
  ARRAY_INDEX_MAX,
  isValidArrayIndex,
  parseArrayIndex,
} from 'src/common/utils';

describe('array-index.helper', () => {
  it('should expose the max valid Redis array index (2^64 - 2)', () => {
    expect(ARRAY_INDEX_MAX).toEqual(BigInt('18446744073709551614'));
  });

  describe('parseArrayIndex', () => {
    it.each([
      { input: '0', expected: '0' },
      { input: '7', expected: '7' },
      { input: '007', expected: '7' }, // leading zeros normalized
      { input: ' 42 ', expected: '42' }, // outer whitespace trimmed
      { input: '18446744073709551614', expected: '18446744073709551614' }, // max valid (2^64 - 2)
      { input: '18446744073709551615', expected: null }, // 2^64 - 1 — reserved
      { input: '18446744073709551616', expected: null }, // 2^64
      { input: '184467440737095516150', expected: null }, // 21 digits — length guard
      { input: '00000000000000000000042', expected: null }, // >20 chars — guard trumps normalization
      { input: '-1', expected: null },
      { input: '1.5', expected: null },
      { input: '1e3', expected: null },
      { input: '0x10', expected: null },
      { input: 'abc', expected: null },
      { input: '1 2', expected: null }, // internal whitespace
      { input: '', expected: null },
      { input: '   ', expected: null },
    ])('should return $expected for $input', ({ input, expected }) => {
      expect(parseArrayIndex(input)).toEqual(expected);
    });

    it.each([null, undefined, 7, BigInt(7), {}])(
      'should return null for non-string %p',
      (input) => {
        expect(parseArrayIndex(input)).toEqual(null);
      },
    );
  });

  describe('isValidArrayIndex', () => {
    it('should return true for a valid index', () => {
      expect(isValidArrayIndex('123')).toEqual(true);
    });
    it('should return false for an invalid index', () => {
      expect(isValidArrayIndex('-1')).toEqual(false);
    });
    it('should return false for non-string input', () => {
      expect(isValidArrayIndex(42)).toEqual(false);
    });
  });
});
