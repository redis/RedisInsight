import { WhatsNewVersion } from './types'
import { version360 } from './versions/v3.6.0'

// One module per release — add the new version here in each release PR.
export const WHATS_NEW_VERSIONS: WhatsNewVersion[] = [version360]

export * from './types'
