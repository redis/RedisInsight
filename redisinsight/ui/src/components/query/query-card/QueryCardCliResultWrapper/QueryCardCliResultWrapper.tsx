import React, { useMemo } from 'react'
import cx from 'classnames'
import { isArray } from 'lodash'

import { LoadingContent } from 'uiSrc/components/base/layout'
import { CommandExecutionResult } from 'uiSrc/slices/interfaces'
import { ResultsMode } from 'uiSrc/slices/interfaces/workbench'
import {
  cliParseTextResponse,
  formatToText,
  getDbIndex,
  isGroupResults,
  Maybe,
  replaceEmptyValue,
} from 'uiSrc/utils'

import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import { Text } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import QueryCardCliDefaultResult from '../QueryCardCliDefaultResult'
import QueryCardCliGroupResult from '../QueryCardCliGroupResult'
import styles from './styles.module.scss'
import {
  CopyResultButton,
  ResultContainer,
} from './QueryCardCliResultWrapper.styles'

export interface Props {
  query: string
  result: Maybe<CommandExecutionResult[]>
  loading?: boolean
  resultsMode?: ResultsMode
  isNotStored?: boolean
  isFullScreen?: boolean
  db?: number
}

export const getResultText = (
  result: Maybe<CommandExecutionResult[]>,
  query: string,
  resultsMode?: ResultsMode,
  db?: number,
): string => {
  if (!result?.length) return ''

  // Handle group results
  if (isGroupResults(resultsMode) && isArray(result[0]?.response)) {
    return result[0].response
      .map(
        (item: {
          command: string
          response: unknown
          status: CommandExecutionStatus
        }) => {
          const dbPrefix = getDbIndex(db)
          const commandPrefix = dbPrefix
            ? `${dbPrefix} > ${item.command}`
            : `> ${item.command}`
          const responseText =
            item.status === CommandExecutionStatus.Success
              ? formatToText(replaceEmptyValue(item.response), item.command)
              : replaceEmptyValue(item.response)
          return `${commandPrefix}\n${responseText}`
        },
      )
      .join('\n\n')
  }

  // Handle single result
  if (result[0]?.status === CommandExecutionStatus.Success) {
    return formatToText(replaceEmptyValue(result[0]?.response), query)
  }

  return replaceEmptyValue(result[0]?.response)?.toString() ?? ''
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

  const copyText = useMemo(
    () => getResultText(result, query, resultsMode, db),
    [result, query, resultsMode, db],
  )

  return (
    <ResultContainer
      data-testid="query-cli-result-wrapper"
      className={cx('queryResultsContainer', styles.container)}
    >
      {!loading && (
        <>
          <CopyResultButton
            copy={copyText}
            aria-label="Copy result"
            data-testid="copy-result"
            tooltipConfig={{ content: 'Copy result' }}
          />
          <div data-testid="query-cli-result" className={cx(styles.content)}>
            {isNotStored && (
              <Text className={styles.alert} data-testid="query-cli-warning">
                <RiIcon type="ToastDangerIcon" className={styles.alertIcon} />
                The result is too big to be saved. It will be deleted after the
                application is closed.
              </Text>
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
          </div>
        </>
      )}
      {loading && (
        <div className={styles.loading} data-testid="query-cli-loader">
          <LoadingContent lines={1} />
        </div>
      )}
    </ResultContainer>
  )
}

export default React.memo(QueryCardCliResultWrapper)
