/**
 * Quotes a Redis argument that may contain whitespace or quotes so a command
 * preview stays runnable when copied into CLI / Workbench. Mirrors redis-cli's
 * double-quoted-string rules: backslash and double-quote are backslash-escaped.
 */
export const quoteRedisArgument = (value: string): string => {
  if (value.length === 0) return '""'
  if (!/[\s"\\]/.test(value)) return value
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}
