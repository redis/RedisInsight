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
 * The entry to auto-open after updating to `toVersion`, or null. `toVersion`
 * must be in the feed. A patch entry resolves to the newest non-patch entry at
 * or below it, so users skipping a minor release still see its highlights.
 * Null when that entry has no cards or is not newer than the last version seen.
 */
export const getWhatsNewAutoOpenVersion = (
  toVersion: string,
  lastVersionSeen: string | null,
): string | null => {
  const versionEntry = whatsNewFeed.find((v) => v.version === toVersion)
  if (!versionEntry) return null

  const targetEntry =
    versionEntry.type !== WhatsNewVersionType.Patch
      ? versionEntry
      : whatsNewFeed.find(
          (v) =>
            v.type !== WhatsNewVersionType.Patch &&
            !isVersionHigher(v.version, toVersion),
        )

  const hasCards = !!targetEntry?.cards?.length
  const isNewerThanSeen =
    !!targetEntry &&
    (!lastVersionSeen || isVersionHigher(targetEntry.version, lastVersionSeen))

  return targetEntry && hasCards && isNewerThanSeen ? targetEntry.version : null
}

export const isWhatsNewEligible = (
  toVersion: string,
  lastVersionSeen: string | null,
): boolean => !!getWhatsNewAutoOpenVersion(toVersion, lastVersionSeen)
