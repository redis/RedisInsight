import { merge } from 'lodash'
import { themeDark } from '@redis-ui/styles'
import { color } from 'uiSrc/styles/custom/dark_theme/color'
import components from 'uiSrc/styles/custom/dark_theme/components'

// Create modified dark theme with legacy colors
export const customDarkTheme = merge({}, themeDark, { color }, { components })
