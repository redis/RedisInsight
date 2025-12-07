import {
  BrowserStorageItem,
  Theme,
  THEME_MATCH_MEDIA_DARK,
} from 'uiSrc/constants'
import { localStorageService } from './storage'

interface Themes {
  [theme: string]: string
}

class ThemeService {
  readonly themes: Themes = {}

  registerTheme(theme: Theme, cssFiles: any) {
    this.themes[theme] = cssFiles
  }

  applyTheme(newTheme: Theme) {
    let actualTheme = newTheme

    if (newTheme === Theme.System) {
      actualTheme = window.matchMedia?.(THEME_MATCH_MEDIA_DARK)?.matches
        ? Theme.Dark
        : Theme.Light
    }

    const sheet = new CSSStyleSheet()
    sheet?.replaceSync(this.themes[actualTheme])

    document.adoptedStyleSheets = [sheet]

    localStorageService.set(BrowserStorageItem.theme, newTheme)
    document.body.classList.value = `theme_${actualTheme}`
  }

  static getTheme() {
    return localStorageService.get(BrowserStorageItem.theme)
  }
}
export const themeService = new ThemeService()
export default ThemeService
