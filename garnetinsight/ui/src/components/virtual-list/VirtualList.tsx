import React, { useEffect, useRef, useState } from 'react'
import { ListChildComponentProps, VariableSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

import styles from './styles.module.scss'

export interface Props {
  items: (string | JSX.Element)[]
  overscanCount?: number
  minRowHeight?: number
  dynamicHeight?: {
    itemsCount: number
    maxHeight: number
  }
}

const PROTRUDING_OFFSET = 2
const MIN_ROW_HEIGHT = 18
const OVERSCAN_COUNT = 20
const MAX_LIST_HEIGHT = globalThis.innerHeight

const VirtualList = (props: Props) => {
  const {
    items = [],
    dynamicHeight,
    overscanCount = OVERSCAN_COUNT,
    minRowHeight = MIN_ROW_HEIGHT,
  } = props
  const {
    itemsCount: dynamicItemsCount = 0,
    maxHeight: dynamicMaxHeight = MAX_LIST_HEIGHT,
  } = dynamicHeight || {}

  const listRef = useRef<List>(null)
  const rowHeights = useRef<{ [key: number]: number }>({})
  const outerRef = useRef<HTMLDivElement>(null)

  const [listHeight, setListHeight] = useState(MIN_ROW_HEIGHT)
  const [, forceRender] = useState({})

  const getRowHeight = (index: number) =>
    rowHeights.current[index] > minRowHeight
      ? rowHeights.current[index] + 2
      : minRowHeight

  const setRowHeight = (index: number, size: number) => {
    listRef.current?.resetAfterIndex(0)
    rowHeights.current = { ...rowHeights.current, [index]: size }
  }

  const calculateHeight = () => {
    listRef.current?.resetAfterIndex(0)
    if (dynamicItemsCount && items.length > dynamicItemsCount) {
      setListHeight(dynamicMaxHeight)
    }

    setListHeight(
      Math.min(
        items.reduce((prev, _item, index) => getRowHeight(index) + prev, 0),
        dynamicMaxHeight,
      ),
    )
  }

  const Row = ({ index, style }: ListChildComponentProps) => {
    const rowRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (rowRef.current) {
        setRowHeight(index, rowRef.current?.clientHeight)
        calculateHeight()
      }
    }, [rowRef])

    const rowContent = items[index]

    return (
      <div style={style} className={styles.item} data-testid={`row-${index}`}>
        <div className={styles.message} ref={rowRef}>
          {rowContent}
        </div>
      </div>
    )
  }

  return (
    <AutoSizer disableHeight={!!dynamicHeight} onResize={() => forceRender({})}>
      {({ width, height = 0 }) => (
        <List
          itemCount={items.length}
          itemSize={getRowHeight}
          ref={listRef}
          className={styles.listContent}
          outerRef={outerRef}
          overscanCount={overscanCount}
          height={height || listHeight}
          width={width - PROTRUDING_OFFSET}
        >
          {Row}
        </List>
      )}
    </AutoSizer>
  )
}

export default VirtualList
