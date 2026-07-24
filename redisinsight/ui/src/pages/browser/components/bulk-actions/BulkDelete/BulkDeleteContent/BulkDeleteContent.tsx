import React, { useEffect, useRef } from 'react'
import { ListChildComponentProps, VariableSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import { useAppSelector } from 'uiSrc/slices/hooks'

import { MAX_BULK_ACTION_ERRORS_LENGTH } from 'uiSrc/constants'
import { Text } from 'uiSrc/components/base/text'
import { bulkActionsDeleteSummarySelector } from 'uiSrc/slices/browser/bulkActions'
import { useTranslation } from 'uiSrc/i18n'
import styles from './styles.module.scss'

const MIN_ROW_HEIGHT = 30
const PROTRUDING_OFFSET = 2

const BulkDeleteContent = () => {
  const { t } = useTranslation()
  const { errors = [] } = useAppSelector(bulkActionsDeleteSummarySelector) ?? {}

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
      <div style={style} className={styles.item} data-testid={`row-${index}`}>
        <span ref={rowRef}>
          <span className={styles.key}>{key}</span>
          <span className={styles.error}>{error}</span>
        </span>
      </div>
    )
  }

  if (!errors.length) {
    return null
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text className={styles.headerTitle}>
          {t('browser.bulkActions.delete.errorList')}
        </Text>
        {errors.length >= MAX_BULK_ACTION_ERRORS_LENGTH && (
          <Text className={styles.headerSummary}>
            {t('browser.bulkActions.delete.lastErrors', {
              count: MAX_BULK_ACTION_ERRORS_LENGTH,
            })}
          </Text>
        )}
      </div>
      <div className={styles.list}>
        <AutoSizer>
          {({ width, height }) => (
            <List
              ref={listRef}
              outerRef={outerRef}
              height={height}
              itemCount={errors.length}
              itemSize={getRowHeight}
              width={width - PROTRUDING_OFFSET}
              className={styles.listContent}
              overscanCount={30}
              itemData={width}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </div>
    </div>
  )
}

export default BulkDeleteContent
