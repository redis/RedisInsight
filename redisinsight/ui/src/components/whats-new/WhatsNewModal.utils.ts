export const formatReleaseDate = (iso?: string, locale?: string): string => {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale || 'en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    // format the date-only ISO string in UTC so it never shifts a day locally
    timeZone: 'UTC',
  }).format(date)
}
