// <Trans> parses interpolated values as markup (escapeValue is off), so a
// user-provided value containing e.g. "<br/>" would be rendered as a tag.
// Escape such values before passing them to <Trans> via `values`.
export const escapeTrans = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
