import React from 'react'
import { isArray } from 'lodash'

import { LoadingContent } from 'uiSrc/components/base/layout'
import { CommandExecutionResult } from 'uiSrc/slices/interfaces'
import { ResultsMode } from 'uiSrc/slices/interfaces/workbench'
import {
  cliParseTextResponse,
  formatToText,
  isGroupResults,
  Maybe,
  replaceEmptyValue,
} from 'uiSrc/utils'

import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import QueryCardCliDefaultResult from '../QueryCardCliDefaultResult'
import QueryCardCliGroupResult from '../QueryCardCliGroupResult'
import * as S from './QueryCardCliResultWrapper.styles'

export interface Props {
  query: string
  result: Maybe<CommandExecutionResult[]>
  loading?: boolean
  resultsMode?: ResultsMode
  isNotStored?: boolean
  isFullScreen?: boolean
  db?: number
}

const QueryCardCliResultWrapper = (props: Props) => {
  const {
    result = [],
    query,
    loading,
    resultsMode,
    isNotStored,
    isFullScreen,
    db,
  } = props

  return (
    <S.Container data-testid="query-cli-result-wrapper">
      {!loading && (
        <S.Content data-testid="query-cli-result">
          {isNotStored && (
            <S.Alert data-testid="query-cli-warning">
              <S.AlertIcon>
                <RiIcon type="ToastDangerIcon" />
              </S.AlertIcon>
              The result is too big to be saved. It will be deleted after the
              application is closed.
            </S.Alert>
          )}
          {isGroupResults(resultsMode) && isArray(result[0]?.response) ? (
            <QueryCardCliGroupResult
              result={result}
              isFullScreen={isFullScreen}
              db={db}
            />
          ) : (
            <QueryCardCliDefaultResult
              isFullScreen={isFullScreen}
              items={
                result[0]?.status === CommandExecutionStatus.Success
                  ? formatToText(
                      replaceEmptyValue(result[0]?.response),
                      query,
                    ).split('\n')
                  : [
                      cliParseTextResponse(
                        replaceEmptyValue(result[0]?.response),
                        '',
                        result[0]?.status,
                      ),
                    ]
              }
            />
          )}
        </S.Content>
      )}
      {loading && (
        <S.Loading data-testid="query-cli-loader">
          <LoadingContent lines={1} />
        </S.Loading>
      )}
    </S.Container>
  )
}

export default React.memo(QueryCardCliResultWrapper)
