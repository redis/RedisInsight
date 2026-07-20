// Normalize an integer/bulk reply to a decimal string so u64 indexes survive
// the wire. Returns null for nil replies (e.g. ARNEXT when the cursor is
// exhausted) so callers can distinguish absence from a real value.
export const toIndexString = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'number') return String(value);
  if (Buffer.isBuffer(value)) return value.toString('utf8');
  return String(value);
};

// Strict variant for callers where the upstream key/type check guarantees
// Redis cannot return nil (ARLEN / ARCOUNT / ARSCAN element index).
export const toRequiredIndexString = (value: unknown): string => {
  const result = toIndexString(value);
  if (result === null) {
    throw new Error('Unexpected nil reply where a value was required.');
  }
  return result;
};
