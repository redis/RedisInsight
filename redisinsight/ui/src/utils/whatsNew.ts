import {
  WHATS_NEW_VERSIONS,
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
 * The feed with flag-gated cards resolved against the current feature flags:
 * hidden cards are dropped, versions left with no cards are omitted.
 */
export const getVisibleWhatsNewVersions = (
  features?: FeatureFlagsMap,
): WhatsNewFeed =>
  whatsNewFeed
    .map((version) => ({
      ...version,
      cards: version.cards.filter(
        (card) => !card.featureFlag || features?.[card.featureFlag]?.flag,
      ),
    }))
    .filter((version) => version.cards.length > 0)

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
