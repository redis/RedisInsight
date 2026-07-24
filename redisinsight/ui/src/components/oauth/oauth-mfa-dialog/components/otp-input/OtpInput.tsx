import React, { useEffect, useRef } from 'react'

import * as S from './OtpInput.styles'
import { OtpInputProps } from './OtpInput.types'

const DEFAULT_LENGTH = 6
const DIGITS_ONLY = /\d/g

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

  const focusAt = (index: number) => {
    const target = inputsRef.current[Math.max(0, Math.min(index, length - 1))]
    target?.focus()
    target?.select()
  }

  // refocus the first box when the code is rejected so the user can retype
  useEffect(() => {
    if (isInvalid) {
      inputsRef.current[0]?.focus()
    }
  }, [isInvalid])

  const emit = (next: string) => {
    onChange(next)
    if (next.length === length) {
      onComplete?.(next)
    }
  }

  const handleChange =
    (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = (e.target.value.match(DIGITS_ONLY) || []).join('')
      if (!digits) {
        return
      }

      const chars = value.split('')
      // typing into a box keeps the last digit entered there
      chars[index] = digits[digits.length - 1]
      emit(chars.join('').slice(0, length))
      focusAt(index + 1)
    }

  const handleKeyDown =
    (index: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
      const chars = value.split('')

      if (e.key === 'Backspace') {
        e.preventDefault()
        if (chars[index]) {
          chars[index] = ''
          onChange(chars.join(''))
        } else if (index > 0) {
          chars[index - 1] = ''
          onChange(chars.join(''))
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
    const pasted = (e.clipboardData.getData('text').match(DIGITS_ONLY) || [])
      .join('')
      .slice(0, length)

    if (!pasted) {
      return
    }

    emit(pasted)
    focusAt(pasted.length)
  }

  return (
    <S.Container data-testid={dataTestid}>
      {Array.from({ length }).map((_, index) => (
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
          value={value[index] ?? ''}
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
