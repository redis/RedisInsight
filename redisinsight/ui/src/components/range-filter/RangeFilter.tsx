import React, { useCallback, useState, useEffect, useRef } from 'react'

import { FormatedDate } from '../formated-date'
import * as S from './RangeFilter.styles'

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
      <S.RangeWrapper data-testid="mock-blank-range">
        <S.SliderTrack $mock />
      </S.RangeWrapper>
    )
  }

  if (start === end) {
    return (
      <S.RangeWrapper data-testid="mock-fill-range">
        <S.SliderRange $mock className="slider-range">
          <S.SliderLeftValue data-testid="range-left-timestamp">
            <FormatedDate date={start?.toString()} />
          </S.SliderLeftValue>
          <S.SliderRightValue data-testid="range-right-timestamp">
            <FormatedDate date={end?.toString()} />
          </S.SliderRightValue>
        </S.SliderRange>
      </S.RangeWrapper>
    )
  }

  const isLeftPosition = max - startVal < (max - min) / 2
  const isRightPosition = max - endVal > (max - min) / 2

  return (
    <>
      <S.RangeWrapper data-testid="range-bar">
        <S.Thumb
          type="range"
          min={min}
          max={max}
          value={startVal}
          ref={minValRef}
          disabled={disabled}
          onChange={onChangeStart}
          onMouseUp={onMouseUpStart}
          $zIndex3
          data-testid="range-start-input"
        />
        <S.Thumb
          type="range"
          min={min}
          max={max}
          value={endVal}
          ref={maxValRef}
          disabled={disabled}
          onChange={onChangeEnd}
          onMouseUp={onMouseUpEnd}
          $zIndex4
          data-testid="range-end-input"
        />
        <S.Slider>
          <S.SliderTrack />
          <S.SliderRange
            ref={range}
            className={`slider-range ${disabled ? 'disabled' : ''}`}
            $leftPosition={isLeftPosition}
            $disabled={disabled}
          >
            <S.SliderLeftValue
              $leftPosition={isLeftPosition}
              $disabled={disabled}
            >
              <FormatedDate date={startVal?.toString()} />
            </S.SliderLeftValue>
            <S.SliderRightValue
              $rightPosition={isRightPosition}
              $disabled={disabled}
            >
              <FormatedDate date={endVal?.toString()} />
            </S.SliderRightValue>
          </S.SliderRange>
        </S.Slider>
      </S.RangeWrapper>
      {(start !== min || end !== max) && (
        <S.ResetButton
          data-testid="range-filter-btn"
          type="button"
          onClick={handleResetFilter}
        >
          {buttonString}
        </S.ResetButton>
      )}
    </>
  )
}

export default RangeFilter
