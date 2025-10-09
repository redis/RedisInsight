import React from 'react'
import { take } from 'lodash'
import cx from 'classnames'

import { Nullable, getDbIndex, isGroupResults, truncateText } from 'uiSrc/utils'
import { RiTooltip } from 'uiSrc/components'
import { EMPTY_COMMAND } from 'uiSrc/constants'
import { ResultsMode } from 'uiSrc/slices/interfaces'
import styles from './styles.module.scss'

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
      <pre
        key={index}
        className={cx(styles.queryLine, styles.queryMultiLine, {
          [styles.queryLineFolding]: isFolding,
        })}
      >
        <div className={styles.queryLineNumber}>{`${index + 1}`}</div>
        <span>{command}</span>
      </pre>
    )
  })

  return (
    <RiTooltip
      className={styles.tooltip}
      anchorClassName={styles.tooltipAnchor}
      content={contentItems}
      position="bottom"
    >
      <span
        data-testid="query-card-tooltip-anchor"
        className={styles.tooltipAnchor}
      >
        {`${!isGroupResults(resultsMode) ? getDbIndex(db) : ''} ${command}`.trim()}
      </span>
    </RiTooltip>
  )
}

export default QueryCardTooltip
