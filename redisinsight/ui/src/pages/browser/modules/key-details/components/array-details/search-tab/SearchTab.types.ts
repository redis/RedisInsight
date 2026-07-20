import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

export interface SearchTabProps {
  keyProp: RedisResponseBuffer | null
  /** True when this is the visible tab — only the active tab's table drives
   *  the shared key-header refresh flag and keeps its editor open. */
  isActive: boolean
}
