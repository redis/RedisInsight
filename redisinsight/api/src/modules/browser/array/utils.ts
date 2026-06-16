// Integer/bulk replies for indexes and counts may arrive as Buffer, string,
// number, or bigint depending on the client mode. Normalize to a decimal
// string so the unsigned 64-bit contract is preserved on the wire.
//
// Returns `null` for nil replies so callers can distinguish absence from a
// real value (e.g. ARNEXT returns nil when the insertion cursor is exhausted).
// Without this guard `String(null)` / `String(undefined)` would emit the
// literal strings "null" / "undefined" and corrupt downstream JSON.
export const toIndexString = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'number') return String(value);
  if (Buffer.isBuffer(value)) return value.toString('utf8');
  return String(value);
};

// Strict variant for callers where the upstream key/type check guarantees
// Redis cannot return nil (e.g. ARLEN / ARCOUNT / ARMGET element lookup
// on a verified array key). Throws on nil to surface unexpected states
// rather than emit a corrupt response.
export const toRequiredIndexString = (value: unknown): string => {
  const result = toIndexString(value);
  if (result === null) {
    throw new Error('Unexpected nil reply where a value was required.');
  }
  return result;
};
