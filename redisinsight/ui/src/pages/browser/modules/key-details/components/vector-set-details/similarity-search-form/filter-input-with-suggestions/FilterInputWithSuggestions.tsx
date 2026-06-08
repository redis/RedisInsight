import React, {
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { TextInput } from 'uiSrc/components/base/inputs'
import * as keys from 'uiSrc/constants/keys'

import { SUGGESTIONS_HINT } from './constants'
import * as S from './FilterInputWithSuggestions.styles'
import { FilterInputWithSuggestionsProps } from './FilterInputWithSuggestions.types'
import {
  findActiveDotToken,
  findUsedAttributeKeys,
  isWordChar,
} from './FilterInputWithSuggestions.utils'

export const FilterInputWithSuggestions = ({
  value,
  onChange,
  suggestions,
  placeholder,
  disabled,
  testId,
}: FilterInputWithSuggestionsProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [caret, setCaret] = useState<number>(value.length)
  const [isFocused, setIsFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  // `dotIndex` of the token that was dismissed via Escape. Suppresses the
  // dropdown while the caret stays on the same token; cleared as soon as the
  // active token changes so later `.tokens` still get suggestions.
  const [dismissedDotIndex, setDismissedDotIndex] = useState<number | null>(
    null,
  )
  const pendingCaretRef = useRef<number | null>(null)

  // Restore caret after `applySuggestion` once React has flushed the new value.
  useEffect(() => {
    if (pendingCaretRef.current == null) return
    const pos = pendingCaretRef.current
    pendingCaretRef.current = null
    const el = inputRef.current
    if (!el) return
    el.setSelectionRange(pos, pos)
    setCaret(pos)
  }, [value])

  const activeToken = useMemo(
    () => (isFocused ? findActiveDotToken(value, caret) : null),
    [isFocused, value, caret],
  )

  const filteredSuggestions = useMemo(() => {
    if (!activeToken) return []
    const prefix = activeToken.prefix.toLowerCase()
    const usedKeys = findUsedAttributeKeys(value, activeToken.dotIndex)
    return suggestions.filter(
      (key) => !usedKeys.has(key) && key.toLowerCase().startsWith(prefix),
    )
  }, [activeToken, suggestions, value])

  useEffect(() => {
    if (activeIndex >= filteredSuggestions.length) {
      setActiveIndex(0)
    }
  }, [filteredSuggestions, activeIndex])

  // Clear Escape suppression once the caret leaves the dismissed token so a
  // later `.attribute` (or a return to this one) gets suggestions again.
  useEffect(() => {
    if (
      dismissedDotIndex != null &&
      activeToken?.dotIndex !== dismissedDotIndex
    ) {
      setDismissedDotIndex(null)
    }
  }, [activeToken, dismissedDotIndex])

  const showDropdown =
    activeToken != null &&
    filteredSuggestions.length > 0 &&
    activeToken.dotIndex !== dismissedDotIndex

  const syncCaret = useCallback(() => {
    const el = inputRef.current
    if (!el) return
    setCaret(el.selectionStart ?? value.length)
  }, [value.length])

  const applySuggestion = useCallback(
    (key: string) => {
      if (!activeToken) return
      const before = value.substring(0, activeToken.dotIndex + 1)
      // Replace the whole word-token under the caret, not just up to the caret,
      // so accepting `category` while editing `.ca|t` yields `.category`.
      let tokenEnd = caret
      while (tokenEnd < value.length && isWordChar(value[tokenEnd])) {
        tokenEnd += 1
      }
      const after = value.substring(tokenEnd)
      pendingCaretRef.current = before.length + key.length
      onChange(`${before}${key}${after}`)
    },
    [activeToken, caret, onChange, value],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (!showDropdown) return
      if (event.key === keys.ARROW_DOWN) {
        event.preventDefault()
        setActiveIndex((i) => (i + 1) % filteredSuggestions.length)
      } else if (event.key === keys.ARROW_UP) {
        event.preventDefault()
        setActiveIndex(
          (i) =>
            (i - 1 + filteredSuggestions.length) % filteredSuggestions.length,
        )
      } else if (event.key === keys.ENTER || event.key === keys.TAB) {
        event.preventDefault()
        applySuggestion(filteredSuggestions[activeIndex])
      } else if (event.key === keys.ESCAPE) {
        event.preventDefault()
        if (activeToken) setDismissedDotIndex(activeToken.dotIndex)
      }
    },
    [
      activeIndex,
      activeToken,
      applySuggestion,
      filteredSuggestions,
      showDropdown,
    ],
  )

  const handleChange = useCallback(
    (next: string) => {
      onChange(next)
      const el = inputRef.current
      setCaret(el?.selectionStart ?? next.length)
    },
    [onChange],
  )

  const listboxId = testId ? `${testId}-suggestions` : undefined
  const activeOptionId =
    showDropdown && listboxId ? `${listboxId}-option-${activeIndex}` : undefined

  return (
    <S.Wrapper
      role="combobox"
      aria-expanded={showDropdown}
      aria-haspopup="listbox"
      aria-controls={listboxId}
      data-testid={testId ? `${testId}-wrapper` : undefined}
    >
      <TextInput
        ref={inputRef}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        onKeyUp={syncCaret}
        onClick={syncCaret}
        onFocus={() => {
          setIsFocused(true)
          syncCaret()
        }}
        onBlur={() => setIsFocused(false)}
        aria-autocomplete="list"
        aria-activedescendant={activeOptionId}
        data-testid={testId}
      />
      {showDropdown && (
        <S.SuggestionsPanel>
          <S.SuggestionsHint
            data-testid={testId ? `${testId}-suggestions-hint` : undefined}
          >
            {SUGGESTIONS_HINT}
          </S.SuggestionsHint>
          <S.SuggestionsList
            id={listboxId}
            data-testid={listboxId ?? 'filter-suggestions'}
            role="listbox"
          >
            {filteredSuggestions.map((key, index) => (
              <S.SuggestionItem
                key={key}
                id={listboxId ? `${listboxId}-option-${index}` : undefined}
                $active={index === activeIndex}
                role="option"
                aria-selected={index === activeIndex}
                data-testid={
                  testId
                    ? `${testId}-suggestion-${key}`
                    : `filter-suggestion-${key}`
                }
                onMouseDown={(event) => {
                  event.preventDefault()
                  applySuggestion(key)
                  inputRef.current?.focus()
                }}
                onMouseEnter={() => setActiveIndex(index)}
              >
                {key}
              </S.SuggestionItem>
            ))}
          </S.SuggestionsList>
        </S.SuggestionsPanel>
      )}
    </S.Wrapper>
  )
}
