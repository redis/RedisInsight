/**
 * Common theme exports from @redis-ui/styles
 * This file centralizes theme imports to avoid duplication across theme contexts
 */

// Side-effect CSS imports - these must be imported once
import 'modern-normalize/modern-normalize.css'
import '@redis-ui/styles/normalized-styles.css'
import '@redis-ui/styles/fonts.css'

// Re-export theme utilities from @redis-ui/styles
import { CommonStyles, themesRebrand } from '@redis-ui/styles'

export const { light: themeLight, dark: themeDark } = themesRebrand

export { CommonStyles }
