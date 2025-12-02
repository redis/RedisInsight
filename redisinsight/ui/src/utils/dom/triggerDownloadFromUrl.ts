import { CustomHeaders } from 'uiSrc/constants/api'

/**
 * Triggers a file download from a URL using fetch with proper headers
 * This is necessary for Electron app where window ID authentication is required
 * @param url The full URL to download from
 */
export const triggerDownloadFromUrl = async (url: string): Promise<void> => {
  const headers: Record<string, string> = {}

  // Add window ID header for Electron app authentication
  if (window.windowId) {
    headers[CustomHeaders.WindowId] = window.windowId
  }

  const response = await fetch(url, { headers })

  if (!response.ok) {
    throw new Error(`Download failed: ${response.statusText}`)
  }

  // Extract filename from Content-Disposition header
  const contentDisposition = response.headers.get('content-disposition') || ''
  const filenameMatch = contentDisposition.match(/filename="?([^";\n]+)"?/)
  const filename = filenameMatch?.[1] || 'download'

  // Convert response to blob and trigger download
  const blob = await response.blob()
  const blobUrl = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = blobUrl
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up the blob URL
  URL.revokeObjectURL(blobUrl)
}
