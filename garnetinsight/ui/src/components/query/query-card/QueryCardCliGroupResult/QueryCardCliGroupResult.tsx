import { flatten, isNull } from 'lodash'
import React from 'react'

import { CommandExecutionResult } from 'uiSrc/slices/interfaces'
import {
  cliParseCommandsGroupResult,
  wbSummaryCommand,
  Maybe,
} from 'uiSrc/utils'
import QueryCardCliDefaultResult from '../QueryCardCliDefaultResult'
import { CommonErrorResponse } from '../QueryCardCommonResult'

export interface Props {
  result?: Maybe<CommandExecutionResult[]>
  isFullScreen?: boolean
  db?: number
}

const QueryCardCliGroupResult = (props: Props) => {
  const { result = [], isFullScreen, db } = props

  return (
    <div
      data-testid="query-cli-default-result"
      className="query-card-output-response-success"
    >
      <QueryCardCliDefaultResult
        isFullScreen={isFullScreen}
        items={flatten(
          result?.[0]?.response.map((item: any) => {
            const commonError = CommonErrorResponse(
              item.id,
              item.command,
              item.response,
            )
            if (React.isValidElement(commonError) && !isNull(item.response)) {
              return [wbSummaryCommand(item.command), commonError]
            }
            return flatten(cliParseCommandsGroupResult(item, db))
          }),
        )}
      />
    </div>
  )
}

export default QueryCardCliGroupResult
