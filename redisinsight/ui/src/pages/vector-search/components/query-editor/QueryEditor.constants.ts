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

/** Commands that support FT.EXPLAIN and FT.PROFILE. */
export const EXPLAINABLE_COMMANDS = ['FT.SEARCH', 'FT.AGGREGATE'] as const
