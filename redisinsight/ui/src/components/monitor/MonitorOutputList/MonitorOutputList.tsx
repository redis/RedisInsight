import React, { useCallback, useEffect, useRef } from 'react'
import {
  ListChildComponentProps,
  ListOnScrollProps,
  VariableSizeList as List,
} from 'react-window'

import { ColorText } from 'uiSrc/components/base/text'
import { DEFAULT_ERROR_MESSAGE, getFormatTime } from 'uiSrc/utils'

import * as S from '../Monitor/Monitor.styles'

export interface Props {
  compressed: boolean
  items: any[]
  width: number
  height: number
}

const PROTRUDING_OFFSET = 2
const MIDDLE_SCREEN_RESOLUTION = 460
const SMALL_SCREEN_RESOLUTION = 360
const MIN_ROW_HEIGHT = 17

const MonitorOutputList = (props: Props) => {
  const { compressed, items = [], width = 0, height = 0 } = props

  const autoScrollRef = useRef<boolean>(true)
  const rowHeights = useRef<{ [key: number]: number }>({})
  const outerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<List>(null)
  const hasMountedRef = useRef<boolean>(false)

  useEffect(() => {
    if (autoScrollRef.current) {
      setTimeout(() => {
        scrollToBottom()
      }, 0)
    }
  }, [items])

  const getRowHeight = (index: number) =>
    rowHeights.current[index] > MIN_ROW_HEIGHT
      ? rowHeights.current[index] + 2
      : MIN_ROW_HEIGHT

  const setRowHeight = (index: number, size: number) => {
    listRef.current?.resetAfterIndex(0)
    if (size > MIN_ROW_HEIGHT) {
      rowHeights.current[index] = size
      return
    }

    if (rowHeights.current[index]) {
      delete rowHeights.current[index]
    }
  }

  const scrollToBottom = () => {
    listRef.current?.scrollToItem(items.length - 1, 'end')
    requestAnimationFrame(() => {
      listRef.current?.scrollToItem(items.length - 1, 'end')
    })
  }

  const handleScroll = useCallback((e: ListOnScrollProps) => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }

    if (!outerRef.current) {
      return
    }

    if (
      e.scrollOffset + outerRef.current.offsetHeight ===
      outerRef.current.scrollHeight
    ) {
      autoScrollRef.current = true
      return
    }

    if (!e.scrollUpdateWasRequested) {
      autoScrollRef.current = false
    }
  }, [])

  const getArgs = (args: string[]): JSX.Element => (
    <S.ItemArgs $compressed={compressed}>
      {args?.map((arg, i) => (
        <span key={`${arg + i}`}>
          {i === 0 && <S.ItemCommandFirst>{`"${arg}"`}</S.ItemCommandFirst>}
          {i !== 0 && ` "${arg}"`}
        </span>
      ))}
    </S.ItemArgs>
  )

  const Row = ({ index, style }: ListChildComponentProps) => {
    const {
      time = '',
      args = [],
      database = '',
      source = '',
      isError,
      message = '',
    } = items[index]
    const rowRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (!rowRef.current) return
      setRowHeight(index, rowRef.current?.clientHeight)
    }, [rowRef])

    return (
      <S.Item style={style} data-testid={`row-${index}`}>
        {!isError && (
          <div ref={rowRef}>
            {width > MIDDLE_SCREEN_RESOLUTION && (
              <S.Time>{getFormatTime(time)}&nbsp;</S.Time>
            )}
            {width > SMALL_SCREEN_RESOLUTION && (
              <span>{`[${database} ${source}] `}</span>
            )}
            <span>{getArgs(args)}</span>
          </div>
        )}
        {isError && (
          <ColorText color="danger">
            {message ?? DEFAULT_ERROR_MESSAGE}
          </ColorText>
        )}
      </S.Item>
    )
  }

  return (
    <S.ListWrapper
      as={List}
      height={height}
      itemCount={items.length}
      itemSize={getRowHeight}
      ref={listRef}
      width={width - PROTRUDING_OFFSET}
      outerRef={outerRef}
      onScroll={handleScroll}
      overscanCount={30}
    >
      {Row}
    </S.ListWrapper>
  )
}

export default MonitorOutputList
