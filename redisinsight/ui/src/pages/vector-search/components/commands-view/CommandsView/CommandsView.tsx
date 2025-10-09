import React from 'react'
import { useParams } from 'react-router-dom'

import { CodeButtonParams } from 'uiSrc/constants'
import { ProfileQueryType } from 'uiSrc/pages/workbench/constants'
import { generateProfileQueryForCommand } from 'uiSrc/pages/workbench/utils/profile'
import { Nullable } from 'uiSrc/utils'
import { CommandExecutionUI } from 'uiSrc/slices/interfaces'
import { RunQueryMode, ResultsMode } from 'uiSrc/slices/interfaces/workbench'

import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { DeleteIcon } from 'uiSrc/components/base/icons'
import { ProgressBarLoader } from 'uiSrc/components/base/display'
import { collectTelemetryQueryReRun } from 'uiSrc/pages/vector-search/telemetry'
import QueryCard from '../../QueryCard'

import {
  StyledContainer,
  StyledHeader,
  StyledWrapper,
} from './CommandsView.styles'

export interface Props {
  isResultsLoaded: boolean
  items: CommandExecutionUI[]
  clearing: boolean
  processing: boolean
  activeMode: RunQueryMode
  activeResultsMode?: ResultsMode
  scrollDivRef: React.Ref<HTMLDivElement>
  noResultsPlaceholder?: React.ReactNode
  hideFields?: string[]
  onQueryReRun: (
    query: string,
    commandId?: Nullable<string>,
    executeParams?: CodeButtonParams,
  ) => void
  onQueryDelete: (commandId: string) => void
  onAllQueriesDelete: () => void
  onQueryOpen: (commandId: string) => void
  onQueryProfile: (
    query: string,
    commandId?: Nullable<string>,
    executeParams?: CodeButtonParams,
  ) => void
}
const CommandsView = (props: Props) => {
  const {
    isResultsLoaded,
    items = [],
    clearing,
    processing,
    activeMode,
    activeResultsMode,
    noResultsPlaceholder,
    hideFields,
    onQueryReRun,
    onQueryProfile,
    onQueryDelete,
    onAllQueriesDelete,
    onQueryOpen,
    scrollDivRef,
  } = props
  const { instanceId } = useParams<{ instanceId: string }>()

  const handleQueryProfile = (
    profileType: ProfileQueryType,
    commandExecution: {
      command: string
      mode?: RunQueryMode
      resultsMode?: ResultsMode
    },
  ) => {
    const { command, mode, resultsMode } = commandExecution
    const profileQuery = generateProfileQueryForCommand(command, profileType)
    if (profileQuery) {
      onQueryProfile(profileQuery, null, {
        mode,
        results: resultsMode,
        clearEditor: false,
      })
    }
  }

  return (
    <StyledWrapper as="div" data-testid="commands-view">
      {!isResultsLoaded && (
        <ProgressBarLoader color="primary" data-testid="progress-wb-history" />
      )}
      {!!items?.length && (
        <StyledHeader>
          <EmptyButton
            size="small"
            icon={DeleteIcon}
            onClick={() => onAllQueriesDelete?.()}
            disabled={clearing || processing}
            data-testid="clear-history-btn"
          >
            Clear Results
          </EmptyButton>
        </StyledHeader>
      )}
      <StyledContainer>
        <div ref={scrollDivRef} />
        {items?.length
          ? items.map(
              ({
                command = '',
                isOpen = false,
                result = undefined,
                summary = undefined,
                id = '',
                loading,
                createdAt,
                mode,
                resultsMode,
                emptyCommand,
                isNotStored,
                executionTime,
                db,
              }) => (
                <QueryCard
                  id={id}
                  key={id}
                  isOpen={isOpen}
                  result={result}
                  summary={summary}
                  clearing={clearing}
                  loading={loading}
                  command={command}
                  createdAt={createdAt}
                  activeMode={activeMode}
                  emptyCommand={emptyCommand}
                  isNotStored={isNotStored}
                  executionTime={executionTime}
                  mode={mode}
                  activeResultsMode={activeResultsMode}
                  resultsMode={resultsMode}
                  db={db}
                  hideFields={hideFields}
                  onQueryOpen={() => onQueryOpen(id)}
                  onQueryProfile={(profileType) =>
                    handleQueryProfile(profileType, {
                      command,
                      mode,
                      resultsMode,
                    })
                  }
                  onQueryReRun={() => {
                    onQueryReRun(command, null, {
                      mode,
                      results: resultsMode,
                      clearEditor: false,
                    })
                    collectTelemetryQueryReRun({
                      instanceId,
                      query: command,
                    })
                  }}
                  onQueryDelete={() => onQueryDelete(id)}
                  data-testid={`query-card-${id}`}
                />
              ),
            )
          : null}
        {isResultsLoaded && !items.length && (noResultsPlaceholder ?? null)}
      </StyledContainer>
    </StyledWrapper>
  )
}

export default React.memo(CommandsView)
