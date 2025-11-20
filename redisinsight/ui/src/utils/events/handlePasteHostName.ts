const handlePasteHostName = (
  onHostNamePaste: (text: string) => boolean,
  e: React.ClipboardEvent & {
    originalEvent?: {
      clipboardData: DataTransfer | null
    }
  },
) => {
  const clipboardData = e.clipboardData || e.originalEvent?.clipboardData
  /*
   * If the details were autofilled, stop the default behaviour
   * which would trigger a redundant onChange event. Autofill happens
   * only when the pasted string is a connection string. If the pasted
   * string is not a connection string, we let the default behaviour
   * happen which is inserting the pasted string to the `host` input.
   */
  if (onHostNamePaste(clipboardData.getData('text'))) {
    e.preventDefault()
  }
}

export default handlePasteHostName
