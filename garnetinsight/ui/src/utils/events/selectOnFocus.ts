const selectOnFocus = (
  e: React.FocusEvent,
  callback?: (e: React.FocusEvent) => void,
) => {
  ;(e.target as HTMLInputElement)?.select()
  callback?.(e)
}

export default selectOnFocus
