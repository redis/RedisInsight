import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

export interface ArrayExpandedValueProps {
  /** Slot index — used only to build a stable, unique test id per row. */
  index: string
  /** Populated slot's raw value buffer. The View tab only expands populated
   *  rows (`getIsRowExpandable` rejects empty slots), so this is never null. */
  value: RedisResponseBuffer
}
