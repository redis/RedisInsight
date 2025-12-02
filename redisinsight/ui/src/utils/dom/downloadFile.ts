import { saveAs } from 'file-saver'
import { AxiosResponseHeaders } from 'axios'

export const DEFAULT_FILE_NAME = 'Redis-Insight'

export const downloadFile = (
  data: string = '',
  headers: AxiosResponseHeaders,
) => {
  const contentDisposition = headers?.['content-disposition'] || ''
  const file = new Blob([data], { type: 'text/plain;charset=utf-8' })
  const fileName = contentDisposition.split('"')?.[1] || DEFAULT_FILE_NAME

  saveAs(file, fileName)
}

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
