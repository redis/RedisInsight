import { FeatureFlags } from 'uiSrc/constants/featureFlags'

/**
 * Release "type" of a version entry. Drives whether the modal auto-opens after
 * an update: only `major`/`minor` auto-open, `patch` never does.
 */
export type WhatsNewVersionType = 'major' | 'minor' | 'patch'

export interface WhatsNewLink {
  label: string
  href: string
}

export interface WhatsNewMedia {
  type: 'image' | 'gif'
  src: string
  alt?: string
}

/**
 * A single feature highlight. Intentionally content-agnostic — only
 * presentational primitives, no feature-specific fields — so a new release is
 * described by filling in the same shape without any component changes.
 */
export interface WhatsNewCard {
  /** Stable id, used for telemetry and de-duplication. */
  id: string
  title: string
  /** Short, plain-text description. */
  body: string
  /** Optional pill label for non-default states, e.g. "Improved", "Beta". */
  tag?: string
  /** Optional RiIcon type name or emoji. */
  icon?: string
  /** Optional short hint of where to find the feature in the app. */
  location?: string
  /** Optional media (deferred for v1 content, schema-ready). */
  media?: WhatsNewMedia
  /** Optional links rendered under the card. */
  links?: WhatsNewLink[]
  /** Optional feature flag — the card is hidden when the flag is off. */
  featureFlag?: FeatureFlags
}

export interface WhatsNewVersion {
  version: string
  releaseDate: string
  type: WhatsNewVersionType
  /** Optional override for the "full release notes" link (defaults to the GitHub tag). */
  releaseNotesUrl?: string
  cards: WhatsNewCard[]
}

export type WhatsNewFeed = WhatsNewVersion[]
