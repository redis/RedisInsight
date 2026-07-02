export interface ArrayAddFormProps {
  /** Closes the add panel. `isCancelled` distinguishes an explicit Cancel from
   *  a close-after-success (mirrors the other types' add panels). */
  closePanel: (isCancelled?: boolean) => void
}
