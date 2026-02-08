/* eslint import/prefer-default-export: off */
import path from 'path'
import { IParsedDeepLink } from 'desktopSrc/lib/app/deep-link.handlers'

export const resolveHtmlPath = (
  htmlFileName: string,
  parsedDeepLink?: IParsedDeepLink,
) => {
  let resolved = `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}#/`

  if (parsedDeepLink) {
    try {
      if (parsedDeepLink.initialPage) {
        const initialPage = parsedDeepLink.initialPage.slice(
          +parsedDeepLink.initialPage.startsWith('/'),
        )
        resolved += initialPage
      }

      const queryParameters = new URLSearchParams([
        ['from', parsedDeepLink.from || ''],
        ['target', parsedDeepLink.target || ''],
      ])

      resolved += `${resolved.indexOf('?') !== -1 ? '&' : '?'}${queryParameters.toString()}`
    } catch (_e) {
      // todo: log error
    }
  }

  return resolved
}
