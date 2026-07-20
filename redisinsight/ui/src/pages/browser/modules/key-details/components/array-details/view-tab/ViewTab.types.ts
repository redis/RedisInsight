import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

export interface ViewTabProps {
  keyProp: RedisResponseBuffer | null
  /** True when this is the visible tab — only the active tab's table drives
   *  the shared key-header refresh flag and keeps its editor open. */
  isActive: boolean
  /** Telemetry hooks supplied by KeyDetails — fired when the add panel opens
   *  and when it is dismissed via Cancel, matching the other key types. */
  onOpenAddItemPanel?: () => void
  onCloseAddItemPanel?: () => void
}
