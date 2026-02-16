import React from 'react'

import { RunQueryMode, ResultsMode } from 'uiSrc/slices/interfaces/workbench'

import { Props as BaseQueryProps } from './Query/Query.types'

type QueryProps = Pick<BaseQueryProps, 'useLiteActions'>

export interface Props {
  query: string
  activeMode: RunQueryMode
  resultsMode?: ResultsMode
  queryProps?: QueryProps
  setQuery: (script: string) => void
  setQueryEl: Function
  onKeyDown?: (e: React.KeyboardEvent, script: string) => void
  onSubmit: (value?: string) => void
  onQueryChangeMode: () => void
  onChangeGroupMode: () => void
  onClear?: () => void
}
