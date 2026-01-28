import React, { useEffect, useRef } from 'react'
import { ListChildComponentProps, VariableSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import { useSelector } from 'react-redux'

import { MAX_BULK_ACTION_ERRORS_LENGTH } from 'uiSrc/constants'
import { bulkActionsDeleteSummarySelector } from 'uiSrc/slices/browser/bulkActions'

import * as S from './BulkDeleteContent.styles'

const MIN_ROW_HEIGHT = 30
const PROTRUDING_OFFSET = 2

const BulkDeleteContent = () => {
  const { errors = [] } = useSelector(bulkActionsDeleteSummarySelector) ?? {}

  const outerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<List>(null)
  const rowHeights = useRef<{ [key: number]: number }>({})

  const getRowHeight = (index: number) =>
    rowHeights.current[index] > MIN_ROW_HEIGHT
      ? rowHeights.current[index] + 2
      : MIN_ROW_HEIGHT

  const setRowHeight = (index: number, size: number) => {
    listRef.current?.resetAfterIndex(0)
    rowHeights.current = { ...rowHeights.current, [index]: size }
  }

  const Row = ({ index, style, data: width }: ListChildComponentProps) => {
    const rowRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (rowRef.current) {
        setRowHeight(index, rowRef.current?.offsetHeight + 16)
      }
    }, [rowRef, width])

    const { key, error } = errors[index]

    return (
      <S.Item style={style} data-testid={`row-${index}`}>
        <span ref={rowRef}>
          <S.Key>{key}</S.Key>
          <S.Error>{error}</S.Error>
        </span>
      </S.Item>
    )
  }

  if (!errors.length) {
    return null
  }

  return (
    <S.Container>
      <S.Header>
        <S.HeaderTitle>Error list</S.HeaderTitle>
        {errors.length >= MAX_BULK_ACTION_ERRORS_LENGTH && (
          <S.HeaderSummary>
            last {MAX_BULK_ACTION_ERRORS_LENGTH} errors are shown
          </S.HeaderSummary>
        )}
      </S.Header>
      <S.List>
        <AutoSizer>
          {({ width, height }) => (
            <List
              ref={listRef}
              outerRef={outerRef}
              height={height}
              itemCount={errors.length}
              itemSize={getRowHeight}
              width={width - PROTRUDING_OFFSET}
              overscanCount={30}
              itemData={width}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </S.List>
    </S.Container>
  )
}

export default BulkDeleteContent
