import React, { useCallback, useState } from 'react'

import { Text } from 'uiSrc/components/base/text'
import { Col } from 'uiSrc/components/base/layout/flex'

import { RiTimeInputProps } from './RiTimeInput.types'
import * as S from './RiTimeInput.styles'

const formatCurrentTime = (): string => {
  const now = new Date()
  return [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map((n) => String(n).padStart(2, '0'))
    .join(':')
}

const clampTimePart = (val: number, max: number): number =>
  Math.max(0, Math.min(max, val))

const clampTimeString = (raw: string): string => {
  const parts = raw.split(':').map(Number)
  const hours = clampTimePart(parts[0] ?? 0, 23)
  const minutes = clampTimePart(parts[1] ?? 0, 59)
  const seconds = clampTimePart(parts[2] ?? 0, 59)
  return [hours, minutes, seconds]
    .map((n) => String(n).padStart(2, '0'))
    .join(':')
}

const RiTimeInput = ({ value, onChange, label = 'Time' }: RiTimeInputProps) => {
  const [internalValue, setInternalValue] = useState(
    () => value ?? formatCurrentTime(),
  )
  const displayValue = value ?? internalValue

  const handleChange = useCallback(
    (raw: string) => {
      const clamped = clampTimeString(raw)
      setInternalValue(clamped)
      onChange?.(clamped)
    },
    [onChange],
  )

  return (
    <Col data-testid="ri-time-input">
      {label && <Text size="s">{label}</Text>}
      <S.StyledTimeInput
        type="time"
        step="1"
        value={displayValue}
        onChange={handleChange}
        data-testid="ri-time-input-field"
      />
    </Col>
  )
}

export { RiTimeInput }
