import { RiSelectOption } from 'uiBase/forms'
import { getConfig } from 'uiSrc/config'

const riConfig = getConfig()

export enum Theme {
  Dark = 'DARK',
  Light = 'LIGHT',
  System = 'SYSTEM',
}

export const DEFAULT_THEME = riConfig.app.defaultTheme

export const THEMES: RiSelectOption[] = [
  {
    inputDisplay: 'Match System',
    value: Theme.System,
  },
  {
    inputDisplay: 'Dark Theme',
    value: Theme.Dark,
  },
  {
    inputDisplay: 'Light Theme',
    value: Theme.Light,
  },
]

export const THEME_MATCH_MEDIA_DARK = '(prefers-color-scheme: dark)'

export default THEMES
