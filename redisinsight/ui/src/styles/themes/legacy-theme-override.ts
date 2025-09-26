import { themeDark } from '@redis-ui/styles'
import { merge } from 'lodash'

// Legacy dark theme primary color
const LEGACY_DARK_PRIMARY = '#8ba2ff'

// Component overrides for hardcoded #80dbff colors
const componentOverrides = {
  switchButton: {
    toggleStates: {
      on: {
        normal: {
          bgColor: LEGACY_DARK_PRIMARY,
          borderColor: LEGACY_DARK_PRIMARY,
        }
      }
    }
  },
  radio: {
    variants: {
      primary: {
        on: {
          normal: {
            bgColor: LEGACY_DARK_PRIMARY,
          }
        }
      }
    }
  }
}

// Theme overrides at root level for flexibility
const themeOverrides = {
  components: componentOverrides
}

// Create modified dark theme with legacy colors
export const legacyDarkTheme = merge({}, themeDark, themeOverrides)