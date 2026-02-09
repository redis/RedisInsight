import React from 'react'

import { ResultsMode, RunQueryMode } from 'uiSrc/slices/interfaces/workbench'

export interface Props {
  activeMode: RunQueryMode
  resultsMode?: ResultsMode
  useLiteActions?: boolean
  setQueryEl?: Function
  onKeyDown?: (e: React.KeyboardEvent, script: string) => void
  onQueryChangeMode: () => void
  onChangeGroupMode: () => void
  onClear?: () => void
}
