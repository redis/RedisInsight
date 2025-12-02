/**
 * Triggers a file download from a URL by creating a temporary link element
 * @param url The full URL to download from
 */
export const triggerDownloadFromUrl = (url: string): void => {
  const link = document.createElement('a')
  link.href = url
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
