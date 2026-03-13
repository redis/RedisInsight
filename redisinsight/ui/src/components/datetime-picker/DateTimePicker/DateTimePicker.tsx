import React, { useCallback, useMemo, useState } from 'react'

import { BaseButton } from 'uiSrc/components/base/forms/buttons/Button'
import { ButtonGroup } from 'uiSrc/components/base/forms/button-group/ButtonGroup'
import { Row } from 'uiSrc/components/base/layout/flex'
import { RiDatePicker } from 'uiSrc/components/base/display/date-picker'
import { RiTimeInput } from 'uiSrc/components/base/inputs/time-input'

import { DateTimePickerProps } from './DateTimePicker.types'
import { UNIT_LABELS } from './DateTimePicker.constants'
import * as S from './DateTimePicker.styles'

const buildTimeString = (date: Date): string =>
  [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map((n) => String(n).padStart(2, '0'))
    .join(':')

const parseTimeString = (time: string) => {
  const parts = time.split(':').map(Number)
  return {
    hours: parts[0] ?? 0,
    minutes: parts[1] ?? 0,
    seconds: parts[2] ?? 0,
  }
}

const buildTimestamp = (
  date: Date,
  time: string,
  unit: 'seconds' | 'milliseconds',
): number => {
  const { hours, minutes, seconds } = parseTimeString(time)
  const d = new Date(date)
  d.setHours(hours, minutes, seconds, 0)
  const ms = d.getTime()
  return unit === 'seconds' ? Math.floor(ms / 1000) : ms
}

const DateTimePicker = ({
  onSubmit,
  timestampUnit: initialUnit = 'seconds',
  initialDate,
}: DateTimePickerProps) => {
  const [selectedDay, setSelectedDay] = useState<Date>(
    () => initialDate ?? new Date(),
  )
  const [unit, setUnit] = useState<'seconds' | 'milliseconds'>(initialUnit)
  const [time, setTime] = useState<string>(() =>
    buildTimeString(initialDate ?? new Date()),
  )

  const timestamp = useMemo(
    () => buildTimestamp(selectedDay, time, unit),
    [selectedDay, time, unit],
  )

  const handleDaySelect = useCallback((day: Date | undefined) => {
    if (day) setSelectedDay(day)
  }, [])

  const handleInsert = useCallback(() => {
    onSubmit(timestamp)
  }, [onSubmit, timestamp])

  return (
    <S.Container gap="m" data-testid="datetime-picker">
      <Row gap="m" align="end">
        <RiDatePicker selected={selectedDay} onSelect={handleDaySelect} />
        <RiTimeInput value={time} onChange={setTime} />
      </Row>

      <S.TimestampOutput gap="s" data-testid="datetime-picker-output">
        <ButtonGroup data-testid="datetime-picker-unit-toggle">
          {(['seconds', 'milliseconds'] as const).map((u) => (
            <ButtonGroup.Button
              key={u}
              isSelected={unit === u}
              onClick={() => setUnit(u)}
              data-testid={`datetime-unit-${u}`}
            >
              {UNIT_LABELS[u]}
            </ButtonGroup.Button>
          ))}
        </ButtonGroup>
        <S.TimestampRow align="center" justify="between">
          <S.TimestampValue
            ellipsis
            tooltipOnEllipsis
            size="M"
            color="primary"
            data-testid="datetime-picker-timestamp"
          >
            {timestamp}
          </S.TimestampValue>
          <BaseButton
            size="s"
            onClick={handleInsert}
            data-testid="datetime-picker-insert"
          >
            Insert
          </BaseButton>
        </S.TimestampRow>
      </S.TimestampOutput>
    </S.Container>
  )
}

export default DateTimePicker
