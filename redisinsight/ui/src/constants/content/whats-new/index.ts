import { WhatsNewVersion } from './types'
import { version360 } from './versions/v3.6.0'
import { version341 } from './versions/v3.4.1'
import { version320 } from './versions/v3.2.0'

// One module per release — add the new version here in each release PR.
export const WHATS_NEW_VERSIONS: WhatsNewVersion[] = [
  version360,
  version341,
  version320,
]

export * from './types'
