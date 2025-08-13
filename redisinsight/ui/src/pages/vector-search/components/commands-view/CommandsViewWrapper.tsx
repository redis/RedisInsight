import React from 'react'
import { Nullable } from 'uiSrc/utils'
import { CommandExecutionUI } from 'uiSrc/slices/interfaces'
import { RunQueryMode, ResultsMode } from 'uiSrc/slices/interfaces/workbench'
import { CodeButtonParams } from 'uiSrc/constants'
import CommandsView from './CommandsView'

export interface Props {
  isResultsLoaded: boolean
  items: CommandExecutionUI[]
  clearing: boolean
  processing: boolean
  activeMode: RunQueryMode
  activeResultsMode: ResultsMode
  scrollDivRef: React.Ref<HTMLDivElement>
  noResultsPlaceholder?: React.ReactNode
  hideFields?: string[]
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

const CommandsViewWrapper = (props: Props) => <CommandsView {...props} />

export default React.memo(CommandsViewWrapper)
