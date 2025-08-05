import React from 'react'
import cx from 'classnames'
import { isArray } from 'lodash'

import { RiLoadingContent } from 'uiSrc/components/base/layout'
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
import { Text } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons'
import QueryCardCliDefaultResult from '../QueryCardCliDefaultResult'
import QueryCardCliGroupResult from '../QueryCardCliGroupResult'
import styles from './styles.module.scss'

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
    <div
      data-testid="query-cli-result-wrapper"
      className={cx('queryResultsContainer', styles.container)}
    >
      {!loading && (
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
      )}
      {loading && (
        <div className={styles.loading} data-testid="query-cli-loader">
          <RiLoadingContent lines={1} />
        </div>
      )}
    </div>
  )
}

export default React.memo(QueryCardCliResultWrapper)
