import React from 'react'
import { useDispatch } from 'react-redux'
import { Nullable } from 'uiSrc/utils'
import { CommandExecutionUI } from 'uiSrc/slices/interfaces'
import { RunQueryMode, ResultsMode } from 'uiSrc/slices/interfaces/workbench'
import { CodeButtonParams } from 'uiSrc/constants'
import { toggleOpenWBResult } from 'uiSrc/slices/workbench/wb-results'
import { QueryResultsProvider } from 'uiSrc/components/query/context/query-results.context'
import { QueryResults } from 'uiSrc/components/query/query-results'
import { useWorkbenchResultsTelemetry } from '../../hooks/useWorkbenchResultsTelemetry'
import WbNoResultsMessage from '../wb-no-results-message'

export interface Props {
  isResultsLoaded: boolean
  items: CommandExecutionUI[]
  clearing: boolean
  processing: boolean
  activeMode: RunQueryMode
  activeResultsMode: ResultsMode
  scrollDivRef: React.Ref<HTMLDivElement>
  onQueryReRun: (
    query: string,
    commandId?: Nullable<string>,
    executeParams?: CodeButtonParams,
  ) => void
  onQueryOpen: (commandId: string) => void
  onQueryDelete: (commandId: string) => void
  onAllQueriesDelete: () => void
  onQueryProfile: (
    query: string,
    commandId?: Nullable<string>,
    executeParams?: CodeButtonParams,
  ) => void
}

const WBResultsWrapper = (props: Props) => {
  const dispatch = useDispatch()
  const telemetry = useWorkbenchResultsTelemetry()

  const handleToggleOpen = (id: string) => {
    dispatch(toggleOpenWBResult(id))
  }

  return (
    <QueryResultsProvider telemetry={telemetry}>
      <QueryResults
        {...props}
        onToggleOpen={handleToggleOpen}
        noResultsPlaceholder={<WbNoResultsMessage />}
      />
    </QueryResultsProvider>
  )
}

export default React.memo(WBResultsWrapper)
