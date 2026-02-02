import React from 'react'
import { take } from 'lodash'

import { Nullable, getDbIndex, isGroupResults, truncateText } from 'uiSrc/utils'
import { RiTooltip } from 'uiSrc/components'
import { EMPTY_COMMAND } from 'uiSrc/constants'
import { ResultsMode } from 'uiSrc/slices/interfaces'
import * as S from './QueryCardTooltip.styles'

export interface Props {
  query: Nullable<string>
  summary?: Nullable<string>
  maxLinesNumber?: number
  resultsMode?: ResultsMode
  db?: number
}

interface IQueryLine {
  index: number
  value: string
  isFolding?: boolean
}

const QueryCardTooltip = (props: Props) => {
  const {
    query = '',
    maxLinesNumber = 20,
    summary = '',
    resultsMode,
    db,
  } = props
  const command = summary || query || EMPTY_COMMAND

  let queryLines: IQueryLine[] = (query || EMPTY_COMMAND)
    .split('\n')
    .map((query: string, i) => ({
      value: truncateText(query, 497, '...'),
      index: i,
    }))

  const isMultilineCommand = queryLines.length > 1
  if (queryLines.length > maxLinesNumber) {
    const lastItem = queryLines[queryLines.length - 1]
    queryLines = take(queryLines, maxLinesNumber - 2)
    queryLines.push({
      index: queryLines.length,
      value: ' ...',
      isFolding: true,
    })
    queryLines.push(lastItem)
  }

  const contentItems = queryLines.map((item: IQueryLine) => {
    const { value, index, isFolding } = item
    const command = `${getDbIndex(db)} ${value}`
    return !isMultilineCommand ? (
      <span key={index}>{command}</span>
    ) : (
      <S.QueryLine as="pre" key={index} $multiLine $folding={isFolding}>
        <S.QueryLineNumber
          $folding={isFolding}
        >{`${index + 1}`}</S.QueryLineNumber>
        <span>{command}</span>
      </S.QueryLine>
    )
  })

  return (
    <RiTooltip
      maxWidth={S.TOOLTIP_MAX_WIDTH}
      content={contentItems}
      position="bottom"
    >
      <S.TooltipAnchor data-testid="query-card-tooltip-anchor">
        {`${!isGroupResults(resultsMode) ? getDbIndex(db) : ''} ${command}`.trim()}
      </S.TooltipAnchor>
    </RiTooltip>
  )
}

export default QueryCardTooltip
