import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

export interface NeighbourBandProps {
  keyProp: RedisResponseBuffer
  /** Decimal-string index of the matched element (band centre). */
  matchIndex: string
  /** Neighbours to fetch on each side of the match. */
  count: number
}
