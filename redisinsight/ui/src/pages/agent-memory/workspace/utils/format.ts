import {
  formatLongName,
  formatTimestamp,
  lastConnectionFormat,
} from 'uiSrc/utils'

/**
 * Thin wrappers over the shared date/name utils so the inspector follows
 * the app-wide formatting (and any future datetime-policy change) while
 * keeping the '-' placeholder for absent/invalid values.
 */

const CARD_DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss'

const parseDate = (iso?: string): Date | null => {
  if (!iso) return null
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date
}

export const formatDateTime = (iso?: string): string => {
  const date = parseDate(iso)
  return date ? formatTimestamp(date, CARD_DATETIME_FORMAT) : '-'
}

export const relativeTime = (iso?: string): string => {
  const date = parseDate(iso)
  return date ? lastConnectionFormat(date) : '-'
}

/** `01KTR2ABCDEF...` -> `01KTR2…RGFW6G` like the extension's card ids */
export const shortId = (id?: string): string =>
  id ? formatLongName(id, 13, 6, '…') : ''

export const pluralize = (
  count: number,
  singular: string,
  plural = `${singular}s`,
): string => `${count} ${count === 1 ? singular : plural}`
