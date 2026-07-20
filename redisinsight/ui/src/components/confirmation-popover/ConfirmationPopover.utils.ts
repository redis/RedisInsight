/**
 * Keeps the panel's open-autofocus off the confirm button: the first
 * focusable element in a confirmation popover is the destructive action, so
 * landing focus there would let a stray Enter fire it. Focus the panel
 * element itself instead — Escape and Tab keep working, Enter is inert.
 */
export const focusPanelInsteadOfConfirm = (event: Event) => {
  event.preventDefault()
  ;(event.target as HTMLElement | null)?.focus()
}
