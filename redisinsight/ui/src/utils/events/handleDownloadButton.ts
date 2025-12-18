/**
 * Triggers a client-side download of a text file containing the provided data.
 *
 * This function creates a temporary Blob from the given string data, generates
 * a download link programmatically, and simulates a click event to prompt
 * the browser to download the file with the specified filename.
 *
 * It automatically cleans up the created object URL after use to free memory.
 * Optionally, a callback (`onSuccess`) can be executed once the download
 * process has been initiated successfully.
 *
 * @param data - The string content to be saved in the downloaded file.
 * @param filename - The desired name (with extension) of the downloaded file.
 * @param onSuccess - Optional callback executed after the download trigger completes.
 */
export const handleDownloadButton = (
  data: string,
  filename: string,
  onSuccess?: () => void,
) => {
  try {
    const blob = new Blob([data], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()

    URL.revokeObjectURL(url)

    onSuccess?.()
  } catch (e) {
    // ignore error
  }
}
