import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

export interface ArrayAddFormProps {
  /** The array key being viewed; the element is added to it. */
  keyProp: RedisResponseBuffer
  /** Closes the add panel. `isCancelled` distinguishes an explicit Cancel from
   *  a close-after-success (mirrors the other types' add panels). */
  closePanel: (isCancelled?: boolean) => void
}
