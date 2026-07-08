import {
  WHATS_NEW_VERSIONS,
  WhatsNewCard,
  WhatsNewFeed,
  WhatsNewVersion,
  WhatsNewVersionType,
} from 'uiSrc/constants/content/whats-new'
import { FeatureFlags } from 'uiSrc/constants/featureFlags'
import { FeatureFlagComponent } from 'uiSrc/slices/interfaces'
import { isVersionHigher } from './comparisons'

export type FeatureFlagsMap = { [key in FeatureFlags]?: FeatureFlagComponent }

/** Bundled release content, sorted latest-first. */
export const whatsNewFeed: WhatsNewFeed = [...WHATS_NEW_VERSIONS].sort(
  (a, b) => (isVersionHigher(a.version, b.version) ? -1 : 1),
)

/**
 * Whether a card's feature is currently usable in this build: not flag-gated,
 * or its flag is on. Cards are always shown; inactive ones are only marked.
 */
export const isWhatsNewCardActive = (
  card: WhatsNewCard,
  features?: FeatureFlagsMap,
): boolean => !card.featureFlag || !!features?.[card.featureFlag]?.flag

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
