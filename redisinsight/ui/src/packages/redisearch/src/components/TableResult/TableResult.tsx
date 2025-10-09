import React, { useEffect, useState } from 'react'
import parse from 'html-react-parser'
import cx from 'classnames'
import { flatten, isArray, isEmpty, map, uniq } from 'lodash'
import styled from 'styled-components'

import { Table, ColumnDefinition } from 'uiSrc/components/base/layout/table'
import { ColorText } from 'uiSrc/components/base/text/ColorText'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CopyIcon } from 'uiSrc/components/base/icons'
import { RiTooltip } from 'uiSrc/components/base/tooltip/RITooltip'
import {
  CommandArgument,
  Command,
} from 'uiSrc/packages/redisearch/src/constants'
import {
  formatLongName,
  replaceSpaces,
} from 'uiSrc/packages/redisearch/src/utils'
import MultilineEllipsisText from 'uiSrc/components/base/text/MultilineEllipsisText'

export interface Props {
  query: string
  result: any
  matched?: number
  cursorId?: null | number
}

const EllipsisText = styled(ColorText)`
  overflow: hidden;
  text-overflow: ellipsis;
`

const noResultsMessage = 'No results found.'

const TableResult = React.memo((props: Props) => {
  const { result, query, matched, cursorId } = props

  const [columns, setColumns] = useState<ColumnDefinition<any>[]>([])

  const checkShouldParsedHTML = (query: string) => {
    const command = query.toUpperCase()
    return (
      command.startsWith(Command.Search) &&
      command.includes(CommandArgument.Highlight)
    )
  }

  const handleCopy = (event: React.MouseEvent, text: string) => {
    event.preventDefault()
    event.stopPropagation()

    navigator.clipboard.writeText(text)
  }

  useEffect(() => {
    if (!result?.length) {
      return
    }

    const shouldParsedHTML = checkShouldParsedHTML(query)
    const uniqColumns =
      uniq(flatten(map(result, (doc) => Object.keys(doc)))) ?? []

    const newColumns: ColumnDefinition<any>[] = uniqColumns.map(
      (title: string = ' ') => ({
        header: title,
        id: title,
        accessorKey: title,
        cell: ({ row: { original } }) => {
          const initValue = original[title] || ''
          if (!initValue || (isArray(initValue) && isEmpty(initValue))) {
            return ''
          }

          const value = initValue.toString()
          let cellContent: string | JSX.Element | JSX.Element[] = replaceSpaces(
            initValue.toString().substring(0, 200),
          )

          if (shouldParsedHTML) {
            cellContent = parse(cellContent)
          }

          return (
            <div
              role="presentation"
              className={cx('tooltipContainer')}
              data-testid={`query-column-${title}`}
            >
              <RiTooltip
                position="left"
                title={title}
                anchorClassName={cx('tooltip')}
                content={
                  <MultilineEllipsisText lineCount={7} paddingBlock="s">
                    {formatLongName(value.toString())}
                  </MultilineEllipsisText>
                }
              >
                <div className="copy-btn-wrapper">
                  <EllipsisText className={cx('cell', 'test')}>
                    {cellContent}
                  </EllipsisText>
                  <IconButton
                    icon={CopyIcon}
                    aria-label="Copy result"
                    className="copy-near-btn"
                    onClick={(event: React.MouseEvent) =>
                      handleCopy(event, initValue)
                    }
                  />
                </div>
              </RiTooltip>
            </div>
          )
        },
      }),
    )

    setColumns(newColumns)
  }, [result, query])

  const isDataArr =
    !React.isValidElement(result) && !(isArray(result) && isEmpty(result))
  const isDataEl = React.isValidElement(result)

  return (
    <div className={cx('queryResultsContainer', 'container')}>
      <div className="queryHeader">
        {!!matched && (
          <div className={cx('matched')}>{`Matched: ${matched}`}</div>
        )}
        {!!cursorId && (
          <div className={cx('matched')}>{`Cursor ID: ${cursorId}`}</div>
        )}
      </div>
      {isDataArr && (
        <div data-testid={`query-table-result-${query}`}>
          <Table columns={columns} data={result ?? []} />
        </div>
      )}
      {isDataEl && <div className={cx('resultEl')}>{result}</div>}
      {!isDataArr && !isDataEl && (
        <div className={cx('resultEl')} data-testid="query-table-no-results">
          {noResultsMessage}
        </div>
      )}
    </div>
  )
})

export default TableResult
