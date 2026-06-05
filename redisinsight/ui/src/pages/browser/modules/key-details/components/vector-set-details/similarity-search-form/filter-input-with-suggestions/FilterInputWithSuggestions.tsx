import React, {
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { TextInput } from 'uiSrc/components/base/inputs'

import * as S from './FilterInputWithSuggestions.styles'

export interface FilterInputWithSuggestionsProps {
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  placeholder?: string
  disabled?: boolean
  'data-testid'?: string
}

/**
 * Resolve the attribute-name token actively being typed before the caret.
 *
 * VSIM filter syntax uses `.attribute` to reference attribute fields, so we
 * scan back from the caret for a `.` that is preceded by either nothing or a
 * non-word character (so `3.14` and a trailing decimal don't trigger). Any
 * non-word character between the dot and the caret cancels the token, which
 * lets the user keep typing free-form filter expressions without spurious
 * dropdowns popping up mid-comparison.
 *
 * Returns `null` when there is no active token at the caret.
 */
const DOT_TOKEN_BODY = /^[A-Za-z0-9_]*$/
const isWordChar = (ch: string): boolean => /[A-Za-z0-9_]/.test(ch)

export interface ActiveDotToken {
  dotIndex: number
  prefix: string
}

export const findActiveDotToken = (
  value: string,
  caret: number,
): ActiveDotToken | null => {
  if (caret <= 0) return null
  let i = caret - 1
  while (i >= 0) {
    const ch = value[i]
    if (ch === '.') {
      const before = i === 0 ? '' : value[i - 1]
      if (before !== '' && isWordChar(before)) return null
      const prefix = value.substring(i + 1, caret)
      if (!DOT_TOKEN_BODY.test(prefix)) return null
      return { dotIndex: i, prefix }
    }
    if (!isWordChar(ch)) return null
    i -= 1
  }
  return null
}

/**
 * Collect every fully-typed `.attribute` token in `value`. Used to hide
 * already-referenced attributes from the dropdown so the user can't pick the
 * same one twice. The token currently being typed (its dot at
 * `excludeDotIndex`) is skipped so editing it doesn't make its own suggestion
 * disappear.
 *
 * The regex is created per-call rather than hoisted so we never have to worry
 * about a stale `lastIndex` from an earlier invocation leaking across calls.
 */
export const findUsedAttributeKeys = (
  value: string,
  excludeDotIndex?: number,
): Set<string> => {
  const used = new Set<string>()
  for (const match of value.matchAll(/(^|[^A-Za-z0-9_])\.([A-Za-z0-9_]+)/g)) {
    const dotIndex = (match.index ?? 0) + match[1].length
    if (dotIndex === excludeDotIndex) continue
    used.add(match[2])
  }
  return used
}

const KEY_ARROW_DOWN = 'ArrowDown'
const KEY_ARROW_UP = 'ArrowUp'
const KEY_ENTER = 'Enter'
const KEY_TAB = 'Tab'
const KEY_ESCAPE = 'Escape'

export const FilterInputWithSuggestions = ({
  value,
  onChange,
  suggestions,
  placeholder,
  disabled,
  'data-testid': dataTestId,
}: FilterInputWithSuggestionsProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [caret, setCaret] = useState<number>(value.length)
  const [isFocused, setIsFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  // Caret pending after `onChange` so we can restore selection imperatively
  // once React has flushed the controlled value back into the input.
  const pendingCaretRef = useRef<number | null>(null)

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

  const showDropdown = activeToken != null && filteredSuggestions.length > 0

  const syncCaret = useCallback(() => {
    const el = inputRef.current
    if (!el) return
    const pos = el.selectionStart ?? value.length
    setCaret(pos)
  }, [value.length])

  const applySuggestion = useCallback(
    (key: string) => {
      if (!activeToken) return
      const before = value.substring(0, activeToken.dotIndex + 1)
      // Scan forward from the caret while we're still inside a word so the
      // suggestion replaces the WHOLE token, not just the chars typed so far —
      // otherwise editing `.ca|t` and accepting `category` produces
      // `.categoryt` with the trailing `t` left dangling.
      let tokenEnd = caret
      while (tokenEnd < value.length && isWordChar(value[tokenEnd])) {
        tokenEnd += 1
      }
      const after = value.substring(tokenEnd)
      const nextValue = `${before}${key}${after}`
      const nextCaret = before.length + key.length
      pendingCaretRef.current = nextCaret
      onChange(nextValue)
    },
    [activeToken, caret, onChange, value],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (!showDropdown) return
      if (event.key === KEY_ARROW_DOWN) {
        event.preventDefault()
        setActiveIndex((i) => (i + 1) % filteredSuggestions.length)
      } else if (event.key === KEY_ARROW_UP) {
        event.preventDefault()
        setActiveIndex(
          (i) =>
            (i - 1 + filteredSuggestions.length) % filteredSuggestions.length,
        )
      } else if (event.key === KEY_ENTER || event.key === KEY_TAB) {
        event.preventDefault()
        applySuggestion(filteredSuggestions[activeIndex])
      } else if (event.key === KEY_ESCAPE) {
        event.preventDefault()
        setIsFocused(false)
      }
    },
    [activeIndex, applySuggestion, filteredSuggestions, showDropdown],
  )

  const handleChange = useCallback(
    (next: string) => {
      onChange(next)
      // React's synthetic `onChange` fires after the DOM input has flushed its
      // value and selection, so we can read `selectionStart` synchronously.
      const el = inputRef.current
      setCaret(el?.selectionStart ?? next.length)
    },
    [onChange],
  )

  // Stable IDs for ARIA wiring so the input can advertise the listbox and the
  // currently-highlighted option to assistive tech.
  const listboxId = dataTestId ? `${dataTestId}-suggestions` : undefined
  const activeOptionId =
    showDropdown && listboxId ? `${listboxId}-option-${activeIndex}` : undefined

  return (
    // ARIA 1.2 combobox pattern: the wrapper takes the combobox role +
    // expanded/haspopup/controls so the relationship is announced regardless
    // of which inner element ends up focused. `aria-activedescendant`
    // / `aria-autocomplete` go on the input itself since they describe the
    // textbox behaviour.
    <S.Wrapper
      role="combobox"
      aria-expanded={showDropdown}
      aria-haspopup="listbox"
      aria-controls={listboxId}
      data-testid={dataTestId ? `${dataTestId}-wrapper` : undefined}
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
        // `onMouseDown` on suggestion items calls `preventDefault`, which keeps
        // focus on the input, so the dropdown stays open during a click. A
        // genuine blur (Tab away, outside click) closes the dropdown
        // immediately — no timeout needed.
        onBlur={() => setIsFocused(false)}
        aria-autocomplete="list"
        aria-activedescendant={activeOptionId}
        data-testid={dataTestId}
      />
      {showDropdown && (
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
                dataTestId
                  ? `${dataTestId}-suggestion-${key}`
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
      )}
    </S.Wrapper>
  )
}
