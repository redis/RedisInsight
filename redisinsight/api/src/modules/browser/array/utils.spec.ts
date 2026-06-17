import {
  toIndexString,
  toRequiredIndexString,
} from 'src/modules/browser/array/utils';

describe('toIndexString', () => {
  it('preserves a decimal string as-is', () => {
    expect(toIndexString('18446744073709551610')).toBe('18446744073709551610');
  });

  it('stringifies bigint without precision loss', () => {
    expect(toIndexString(BigInt('18446744073709551610'))).toBe(
      '18446744073709551610',
    );
  });

  it('stringifies number replies', () => {
    expect(toIndexString(42)).toBe('42');
  });

  it('decodes Buffer replies as utf8', () => {
    expect(toIndexString(Buffer.from('42'))).toBe('42');
  });

  it('returns null for nil replies instead of the string "null"', () => {
    expect(toIndexString(null)).toBeNull();
    expect(toIndexString(undefined)).toBeNull();
  });
});

describe('toRequiredIndexString', () => {
  it('returns a decimal string for non-nil replies', () => {
    expect(toRequiredIndexString(7)).toBe('7');
    expect(toRequiredIndexString('7')).toBe('7');
  });

  it('throws for nil replies', () => {
    expect(() => toRequiredIndexString(null)).toThrow(
      'Unexpected nil reply where a value was required.',
    );
    expect(() => toRequiredIndexString(undefined)).toThrow();
  });
});
