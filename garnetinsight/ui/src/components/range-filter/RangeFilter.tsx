import React, { useCallback, useState, useEffect, useRef } from 'react'
import cx from 'classnames'
import styled from 'styled-components'

import { FormatedDate } from '../formated-date'
import styles from './styles.module.scss'
import { Theme } from 'uiSrc/components/base/theme/types'

const SliderRange = styled.div<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
>`
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.primary400};
  height: 1px;
  z-index: 2;
  transform: translateY(2px);

  &:before {
    content: '';
    width: 1px;
    height: 6px;
    position: absolute;
    top: -5px;
    left: -1px;
    background-color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.background.primary400};
  }

  &:after {
    content: '';
    width: 1px;
    height: 6px;
    position: absolute;
    right: -1px;
    background-color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.background.primary400};
  }
`

const buttonString = 'Reset Filter'

export interface Props {
  max: number
  min: number
  start: number
  end: number
  disabled?: boolean
  handleChangeStart: (value: number, shouldSentEventTelemetry: boolean) => void
  handleChangeEnd: (value: number, shouldSentEventTelemetry: boolean) => void
  handleUpdateRangeMax: (value: number) => void
  handleUpdateRangeMin: (value: number) => void
  handleResetFilter: () => void
}

function usePrevious(value: any) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const RangeFilter = (props: Props) => {
  const {
    max,
    min,
    start,
    end,
    disabled = false,
    handleChangeStart,
    handleChangeEnd,
    handleUpdateRangeMax,
    handleUpdateRangeMin,
    handleResetFilter,
  } = props

  const [startVal, setStartVal] = useState(start)
  const [endVal, setEndVal] = useState(end)

  const getPercent = useCallback(
    (value) => Math.round(((value - min) / (max - min)) * 100),
    [min, max],
  )

  const minValRef = useRef<HTMLInputElement>(null)
  const maxValRef = useRef<HTMLInputElement>(null)
  const range = useRef<HTMLInputElement>(null)

  const prevValue = usePrevious({ max, min }) ?? { max: 0, min: 0 }

  const onChangeStart = useCallback(
    ({ target: { value } }) => {
      const newValue = Math.min(+value, endVal - 1)
      setStartVal(newValue)
    },
    [endVal],
  )

  const onMouseUpStart = useCallback(({ target: { value } }) => {
    handleChangeStart(value, true)
  }, [])

  const onMouseUpEnd = useCallback(({ target: { value } }) => {
    handleChangeEnd(value, true)
  }, [])

  const onChangeEnd = useCallback(
    ({ target: { value } }) => {
      const newValue = Math.max(+value, startVal + 1)
      setEndVal(newValue)
    },
    [startVal],
  )

  useEffect(() => {
    if (maxValRef.current) {
      const minPercent = getPercent(startVal)
      const maxPercent = getPercent(+maxValRef.current.value)

      if (range.current) {
        range.current.style.left = `${minPercent}%`
        range.current.style.width = `${maxPercent - minPercent}%`
      }
    }
  }, [startVal, getPercent])

  useEffect(() => {
    if (minValRef.current) {
      const minPercent = getPercent(+minValRef.current.value)
      const maxPercent = getPercent(endVal)

      if (range.current) {
        range.current.style.width = `${maxPercent - minPercent}%`
      }
    }
  }, [endVal, getPercent])

  useEffect(() => {
    setStartVal(start)
  }, [start])

  useEffect(() => {
    setEndVal(end)
  }, [end])

  useEffect(() => {
    if (prevValue.max !== max && end === prevValue.max) {
      handleUpdateRangeMax(max)
    }
    if (prevValue.min !== min && start === prevValue.min) {
      handleUpdateRangeMin(min)
    }
  }, [prevValue])

  if (start === 0 && max !== 0 && end === 0 && min !== 0) {
    return (
      <div data-testid="mock-blank-range" className={styles.rangeWrapper}>
        <div className={cx(styles.sliderTrack, styles.mockRange)} />
      </div>
    )
  }

  if (start === end) {
    return (
      <div data-testid="mock-fill-range" className={styles.rangeWrapper}>
        <SliderRange className={cx(styles.sliderRange, styles.mockRange)}>
          <div
            className={styles.sliderLeftValue}
            data-testid="range-left-timestamp"
          >
            <FormatedDate date={start?.toString()} />
          </div>
          <div
            className={styles.sliderRightValue}
            data-testid="range-right-timestamp"
          >
            <FormatedDate date={end?.toString()} />
          </div>
        </SliderRange>
      </div>
    )
  }

  return (
    <>
      <div className={styles.rangeWrapper} data-testid="range-bar">
        <input
          type="range"
          min={min}
          max={max}
          value={startVal}
          ref={minValRef}
          disabled={disabled}
          onChange={onChangeStart}
          onMouseUp={onMouseUpStart}
          className={cx(styles.thumb, styles.thumbZindex3)}
          data-testid="range-start-input"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={endVal}
          ref={maxValRef}
          disabled={disabled}
          onChange={onChangeEnd}
          onMouseUp={onMouseUpEnd}
          className={cx(styles.thumb, styles.thumbZindex4)}
          data-testid="range-end-input"
        />
        <div className={styles.slider}>
          <div className={styles.sliderTrack} />
          <SliderRange
            ref={range}
            className={cx(styles.sliderRange, {
              [styles.leftPosition]: max - startVal < (max - min) / 2,
              [styles.disabled]: disabled,
            })}
          >
            <div
              className={cx(styles.sliderLeftValue, {
                [styles.leftPosition]: max - startVal < (max - min) / 2,
                [styles.disabled]: disabled,
              })}
            >
              <FormatedDate date={startVal?.toString()} />
            </div>
            <div
              className={cx(styles.sliderRightValue, {
                [styles.rightPosition]: max - endVal > (max - min) / 2,
                [styles.disabled]: disabled,
              })}
            >
              <FormatedDate date={endVal?.toString()} />
            </div>
          </SliderRange>
        </div>
      </div>
      {(start !== min || end !== max) && (
        <button
          data-testid="range-filter-btn"
          className={styles.resetButton}
          type="button"
          onClick={handleResetFilter}
        >
          {buttonString}
        </button>
      )}
    </>
  )
}

export default RangeFilter
