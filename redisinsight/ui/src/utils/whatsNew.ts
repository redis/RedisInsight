import whatsNewContent from 'uiSrc/constants/content/whatsNew.json'
import {
  WhatsNewCard,
  WhatsNewFeed,
  WhatsNewVersion,
  WhatsNewVersionType,
} from 'uiSrc/constants/content/whatsNew.types'
import { isVersionHigher } from './comparisons'

const isValidCard = (card: unknown): card is WhatsNewCard => {
  const c = card as Partial<WhatsNewCard>
  return (
    typeof c?.id === 'string' &&
    typeof c?.title === 'string' &&
    typeof c?.body === 'string'
  )
}

const isValidVersion = (entry: unknown): entry is WhatsNewVersion => {
  const v = entry as Partial<WhatsNewVersion>
  const isValid =
    typeof v?.version === 'string' &&
    Array.isArray(v?.cards) &&
    v.cards.every(isValidCard)

  if (!isValid) {
    console.warn('[whatsNew] Skipping malformed content entry:', entry)
  }
  return isValid
}

/** Bundled content, malformed entries dropped, sorted latest-first. */
export const whatsNewFeed: WhatsNewFeed = (
  whatsNewContent.versions as unknown[]
)
  .filter(isValidVersion)
  .sort((a, b) => (isVersionHigher(a.version, b.version) ? -1 : 1))

export const getLatestWhatsNewVersion = (): WhatsNewVersion | undefined =>
  whatsNewFeed[0]

/**
 * Auto-open eligibility for `toVersion` after an update: in the feed, has
 * cards, not a patch release, and newer than the last version already seen.
 */
export const isWhatsNewEligible = (
  toVersion: string,
  lastVersionSeen: string | null,
): boolean => {
  const versionEntry = whatsNewFeed.find((v) => v.version === toVersion)
  const hasCards = !!versionEntry?.cards?.length
  const isAutoOpenable = versionEntry?.type !== WhatsNewVersionType.Patch
  const isNewerThanSeen =
    !lastVersionSeen || isVersionHigher(toVersion, lastVersionSeen)

  return !!versionEntry && hasCards && isAutoOpenable && isNewerThanSeen
}
