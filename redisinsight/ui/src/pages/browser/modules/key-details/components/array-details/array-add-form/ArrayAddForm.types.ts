export interface ArrayAddFormProps {
  /** Closes the add panel. `isCancelled` distinguishes an explicit Cancel from
   *  a close-after-success (mirrors the other types' add panels). */
  closePanel: (isCancelled?: boolean) => void
  /** Moves the View to show the added element (at `index`) when the user opts
   *  in via the "move to element" checkbox — an append lands past the current
   *  window, so it would otherwise stay hidden. */
  onReveal?: (index: string) => void
}
