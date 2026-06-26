import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

export interface ViewTabProps {
  keyProp: RedisResponseBuffer | null
  /** Telemetry hooks supplied by KeyDetails — fired when the add panel opens
   *  and when it is dismissed via Cancel, matching the other key types. */
  onOpenAddItemPanel?: () => void
  onCloseAddItemPanel?: () => void
}
