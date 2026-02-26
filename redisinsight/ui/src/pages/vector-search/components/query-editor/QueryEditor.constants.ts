import { merge } from 'lodash'
import { defaultMonacoOptions } from 'uiSrc/constants'

export const EDITOR_OPTIONS = merge({}, defaultMonacoOptions, {
  suggest: {
    showWords: false,
    showIcons: true,
    insertMode: 'replace',
    filterGraceful: false,
    matchOnWordStartOnly: true,
  },
})

export const EDITOR_PLACEHOLDER =
  'Start typing FT. to access search commands or switch to Query Library to access saved commands.'

/** Commands that support FT.EXPLAIN and FT.PROFILE. */
export const EXPLAINABLE_COMMANDS = ['FT.SEARCH', 'FT.AGGREGATE'] as const

export const TOOLTIP_EXPLAIN =
  "Shows how your query will run (execution plan) to understand what's used. Acts on FT.SEARCH or FT.AGGREGATE."
export const TOOLTIP_PROFILE =
  'Profiles your query to show where time is spent and spot bottlenecks. Acts on FT.SEARCH or FT.AGGREGATE.'
export const TOOLTIP_DISABLED_NO_QUERY = 'Disabled: no query identified.'
export const TOOLTIP_DISABLED_LOADING = 'Disabled: query is running.'
