import React from 'react'

import { CodeButtonParams } from 'uiSrc/constants'
import { ProfileQueryType } from 'uiSrc/pages/workbench/constants'
import { generateProfileQueryForCommand } from 'uiSrc/pages/workbench/utils/profile'
import { Nullable } from 'uiSrc/utils'
import { QueryCard } from 'uiSrc/components/query'
import { CommandExecutionUI } from 'uiSrc/slices/interfaces'
import { RunQueryMode, ResultsMode } from 'uiSrc/slices/interfaces/workbench'

import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { DeleteIcon } from 'uiSrc/components/base/icons'
import { ProgressBarLoader } from 'uiSrc/components/base/display'
import WbNoResultsMessage from '../../wb-no-results-message'

import * as S from './WBResults.styles'

/** @deprecated Use QueryResultsProps from 'uiSrc/components/query/query-results' instead. */
export interface Props {
  isResultsLoaded: boolean
  items: CommandExecutionUI[]
  clearing: boolean
  processing: boolean
  activeMode: RunQueryMode
  activeResultsMode?: ResultsMode
  scrollDivRef: React.Ref<HTMLDivElement>
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

/** @deprecated Use QueryResults from 'uiSrc/components/query/query-results' instead. */
const WBResults = (props: Props) => {
  const {
    isResultsLoaded,
    items = [],
    clearing,
    processing,
    activeMode,
    activeResultsMode,
    onQueryReRun,
    onQueryProfile,
    onQueryDelete,
    onAllQueriesDelete,
    onQueryOpen,
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
    <S.Wrapper>
      {!isResultsLoaded && (
        <ProgressBarLoader color="primary" data-testid="progress-wb-history" />
      )}
      {!!items?.length && (
        <S.Header align="center" justify="end" grow={false}>
          <EmptyButton
            icon={DeleteIcon}
            onClick={() => onAllQueriesDelete?.()}
            disabled={clearing || processing}
            data-testid="clear-history-btn"
          >
            Clear Results
          </EmptyButton>
        </S.Header>
      )}
      <S.Container>
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
                  onQueryOpen={() => onQueryOpen(id)}
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
                />
              ),
            )
          : null}
        {isResultsLoaded && !items.length && <WbNoResultsMessage />}
      </S.Container>
    </S.Wrapper>
  )
}

export default React.memo(WBResults)
