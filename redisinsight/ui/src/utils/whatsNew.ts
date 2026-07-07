import {
  WHATS_NEW_VERSIONS,
  WhatsNewFeed,
  WhatsNewVersion,
  WhatsNewVersionType,
} from 'uiSrc/constants/content/whats-new'
import { isVersionHigher } from './comparisons'

/** Bundled release content, sorted latest-first. */
export const whatsNewFeed: WhatsNewFeed = [...WHATS_NEW_VERSIONS].sort(
  (a, b) => (isVersionHigher(a.version, b.version) ? -1 : 1),
)

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
