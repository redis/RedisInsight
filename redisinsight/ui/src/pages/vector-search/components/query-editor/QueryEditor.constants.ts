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
  placeholder: 'Enter your RQE query...',
})
