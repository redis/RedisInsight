import React, { useEffect, useRef, useState } from 'react'

import * as S from './OtpInput.styles'
import { OtpInputProps } from './OtpInput.types'

const DEFAULT_LENGTH = 6
const DIGITS_ONLY = /\d/g

// fixed-length representation so clearing a middle box does not shift the rest
const toSlots = (value: string, length: number): string[] =>
  Array.from({ length }, (_, index) => value[index] ?? '')

const OtpInput = ({
  value,
  onChange,
  onComplete,
  length = DEFAULT_LENGTH,
  isInvalid,
  disabled,
  autoFocus,
  ariaLabel,
  'data-testid': dataTestid,
}: OtpInputProps) => {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const [slots, setSlots] = useState<string[]>(() => toSlots(value, length))

  // the parent clears the value to reset the field (error dismissed, dialog closed)
  useEffect(() => {
    if (value === '') {
      setSlots(toSlots('', length))
    }
  }, [value, length])

  // refocus the first box when the code is rejected so the user can retype
  useEffect(() => {
    if (isInvalid) {
      inputsRef.current[0]?.focus()
    }
  }, [isInvalid])

  const focusAt = (index: number) => {
    const target = inputsRef.current[Math.max(0, Math.min(index, length - 1))]
    target?.focus()
    target?.select()
  }

  const commit = (next: string[]) => {
    setSlots(next)
    const code = next.join('')
    onChange(code)
    if (next.every((digit) => digit !== '')) {
      onComplete?.(code)
    }
  }

  // fill the slots from a full code (paste or OS/password-manager autofill) and
  // move focus past the last filled box
  const fillFrom = (raw: string) => {
    const digits = (raw.match(DIGITS_ONLY) || []).join('').slice(0, length)
    if (!digits) {
      return
    }
    commit(toSlots(digits, length))
    focusAt(digits.length)
  }

  const handleChange =
    (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = (e.target.value.match(DIGITS_ONLY) || []).join('')
      if (!digits) {
        return
      }

      // autofill delivers the whole code into one box; spread it across the
      // slots like a paste instead of keeping only the last digit
      if (digits.length > 1) {
        fillFrom(digits)
        return
      }

      const next = [...slots]
      next[index] = digits[digits.length - 1]
      commit(next)
      focusAt(index + 1)
    }

  const handleKeyDown =
    (index: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        e.preventDefault()
        const next = [...slots]
        if (next[index]) {
          next[index] = ''
          commit(next)
        } else if (index > 0) {
          next[index - 1] = ''
          commit(next)
          focusAt(index - 1)
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        focusAt(index - 1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        focusAt(index + 1)
      }
    }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    fillFrom(e.clipboardData.getData('text'))
  }

  return (
    <S.Container gap="l" justify="center" data-testid={dataTestid}>
      {slots.map((digit, index) => (
        <input
          // fixed-length list, index is a stable identity here
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          ref={(el: HTMLInputElement | null) => {
            inputsRef.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digit}
          disabled={disabled}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autoFocus && index === 0}
          aria-label={ariaLabel ? `${ariaLabel} ${index + 1}` : undefined}
          aria-invalid={isInvalid}
          onChange={handleChange(index)}
          onKeyDown={handleKeyDown(index)}
          onPaste={handlePaste}
          onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
          data-testid={dataTestid ? `${dataTestid}-${index}` : undefined}
        />
      ))}
    </S.Container>
  )
}

export default OtpInput
