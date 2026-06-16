// Integer/bulk replies for indexes and counts may arrive as Buffer, string,
// number, or bigint depending on the client mode. Normalize to a decimal
// string so the unsigned 64-bit contract is preserved on the wire.
export const toIndexString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'number') return String(value);
  if (Buffer.isBuffer(value)) return value.toString('utf8');
  return String(value);
};
