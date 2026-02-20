import React from 'react'

import { CodeButtonParams } from 'uiSrc/constants'
import { ProfileQueryType } from 'uiSrc/pages/workbench/constants'
import { generateProfileQueryForCommand } from 'uiSrc/pages/workbench/utils/profile'
import { Nullable } from 'uiSrc/utils'
import { CommandExecutionUI } from 'uiSrc/slices/interfaces'
import { RunQueryMode, ResultsMode } from 'uiSrc/slices/interfaces/workbench'

import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { DeleteIcon } from 'uiSrc/components/base/icons'
import { ProgressBarLoader } from 'uiSrc/components/base/display'
import QueryCard from '../query-card'

import * as S from './QueryResults.styles'

export interface QueryResultsProps {
  isResultsLoaded: boolean
  items: CommandExecutionUI[]
  clearing: boolean
  processing: boolean
  activeMode: RunQueryMode
  activeResultsMode?: ResultsMode
  scrollDivRef: React.Ref<HTMLDivElement>
  noResultsPlaceholder?: React.ReactNode
  onToggleOpen?: (id: string, isOpen: boolean) => void
  onQueryReRun: (
    query: string,
    commandId?: Nullable<string>,
    executeParams?: CodeButtonParams,
  ) => void
  onQueryDelete: (commandId: string) => void
  onAllQueriesDelete: () => void
  onQueryProfile: (
    query: string,
    commandId?: Nullable<string>,
    executeParams?: CodeButtonParams,
  ) => void
}

const QueryResults = (props: QueryResultsProps) => {
  const {
    isResultsLoaded,
    items = [],
    clearing,
    processing,
    activeMode,
    activeResultsMode,
    noResultsPlaceholder,
    onToggleOpen,
    onQueryReRun,
    onQueryProfile,
    onQueryDelete,
    onAllQueriesDelete,
    scrollDivRef,
  } = props

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
    <S.Wrapper data-testid="query-results">
      {!isResultsLoaded && (
        <ProgressBarLoader
          color="primary"
          data-testid="progress-results-history"
        />
      )}
      {!!items?.length && (
        <S.Header align="center" justify="end" grow={false}>
          <EmptyButton
            size="small"
            icon={DeleteIcon}
            onClick={() => onAllQueriesDelete?.()}
            disabled={clearing || processing}
            data-testid="clear-history-btn"
          >
            Clear Results
          </EmptyButton>
        </S.Header>
      )}
      <S.Container grow>
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
                  onToggleOpen={onToggleOpen}
                  onQueryProfile={(profileType) =>
                    handleQueryProfile(profileType, {
                      command,
                      mode,
                      resultsMode,
                    })
                  }
                  onQueryReRun={() =>
                    onQueryReRun(command, null, {
                      mode,
                      results: resultsMode,
                      clearEditor: false,
                    })
                  }
                  onQueryDelete={() => onQueryDelete(id)}
                  data-testid={`query-card-${id}`}
                />
              ),
            )
          : null}
        {isResultsLoaded && !items.length && (noResultsPlaceholder ?? null)}
      </S.Container>
    </S.Wrapper>
  )
}

export default React.memo(QueryResults)
