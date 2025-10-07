import React, { useEffect, useRef, useState } from 'react'
import cx from 'classnames'

import * as keys from 'uiSrc/constants/keys'
import { TextInput } from 'uiSrc/components/base/inputs'
import { GroupBadge, RiTooltip } from 'uiSrc/components'
import { OutsideClickDetector } from 'uiSrc/components/base/utils'
import { Nullable } from 'uiSrc/utils'

import {
  CancelSlimIcon,
  SearchIcon,
  SwitchIcon,
} from 'uiSrc/components/base/icons'
import {
  ActionIconButton,
  IconButton,
} from 'uiSrc/components/base/forms/buttons'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { ProgressBarLoader } from 'uiSrc/components/base/display'
import styles from './styles.module.scss'
import styled from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'

interface StyledMultiSearchProps extends React.HTMLAttributes<HTMLDivElement> {
  $isFocused: boolean
}

const StyledMultiSearch = styled.div<StyledMultiSearchProps>`
  border: 1px solid
    ${({ theme, $isFocused }: { theme: Theme; $isFocused: boolean }) =>
      $isFocused
        ? theme.components.input.states.focused.borderColor
        : theme.components.input.states.normal.borderColor};
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.components.input.states.normal.bgColor};
  border-radius: 4px;
`
const StyledAutoSuggestions = styled.div<React.HTMLAttributes<HTMLDivElement>>`
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.components.select.dropdown.bgColor};
  border-color: ${({ theme }: { theme: Theme }) =>
    theme.components.select.states.disabled.borderColor};
`

interface MultiSearchSuggestion {
  options: null | Array<{
    id: string
    option?: Nullable<string>
    value: string
  }>
  buttonTooltipTitle: string
  onApply: (suggestion: any) => void
  onDelete: (ids: string[]) => void
  loading?: boolean
}

export interface Props {
  value: string
  options?: string[]
  placeholder: string
  disableSubmit?: boolean
  onSubmit: () => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  suggestions?: MultiSearchSuggestion
  onChange: (value: string) => void
  onChangeOptions?: (options: string[]) => void
  onClear?: () => void
  className?: string
  compressed?: boolean
  appendRight?: React.ReactNode
  [key: string]: any
}

const MultiSearch = (props: Props) => {
  const {
    value,
    options = [],
    suggestions,
    placeholder,
    disableSubmit,
    onSubmit,
    onChangeOptions,
    onChange,
    onKeyDown,
    onClear = () => {},
    className,
    compressed,
    appendRight,
    ...rest
  } = props
  const [isInputFocus, setIsInputFocus] = useState<boolean>(false)
  const [showAutoSuggestions, setShowAutoSuggestions] = useState<boolean>(false)
  const [focusedItem, setFocusedItem] = useState<number>(-1)

  const inputRef = useRef<HTMLInputElement>(null)

  const { options: suggestionOptions = [] } = suggestions ?? {}

  const isArrowUpOrDown = (key: string) =>
    [keys.ARROW_DOWN, keys.ARROW_UP].includes(key)

  useEffect(() => {
    if (!suggestionOptions?.length) {
      setFocusedItem(-1)
      setShowAutoSuggestions(false)
    }
  }, [suggestionOptions])

  const onDeleteOption = (option: string) => {
    onChangeOptions?.(options.filter((item) => item !== option))
  }

  const exitAutoSuggestions = () => {
    setFocusedItem(-1)
    setShowAutoSuggestions(false)
  }

  const handleApplySuggestion = (index: number) => {
    suggestions?.onApply?.(suggestionOptions?.[index] ?? null)
    setFocusedItem(-1)
    setShowAutoSuggestions(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation()

    if (!suggestionOptions?.length) {
      onKeyDown?.(e)
      return
    }

    const min = -1
    const max = suggestionOptions.length - 1

    if (!showAutoSuggestions && isArrowUpOrDown(e.key)) {
      e.preventDefault()
      setShowAutoSuggestions(true)
      setFocusedItem(-1)
      return
    }

    if (!showAutoSuggestions) {
      onKeyDown?.(e)
      return
    }

    if (isArrowUpOrDown(e.key)) {
      e.preventDefault()
      const diff = focusedItem + (keys.ARROW_DOWN === e.key ? 1 : -1)
      setFocusedItem(diff > max ? min : diff < min ? max : diff)
    }

    if (e.key === 'Delete') {
      focusedItem > -1 && e.preventDefault()
      handleDeleteSuggestion(
        focusedItem > -1 ? [suggestionOptions[focusedItem].id] : undefined,
      )
    }

    if (keys.ESCAPE === e.key) setShowAutoSuggestions(false)
    if (keys.TAB === e.key) exitAutoSuggestions()
    if (keys.ENTER === e.key) handleApplySuggestion(focusedItem)
  }

  const handleDeleteSuggestion = (ids?: string[]) => {
    inputRef.current?.focus()
    if (ids) {
      suggestions?.onDelete?.(ids)
    }
  }

  const handleSubmit = () => {
    exitAutoSuggestions()
    onSubmit()
  }

  const SubmitBtn = () => (
    <IconButton
      icon={SearchIcon}
      aria-label="Search"
      disabled={disableSubmit}
      size="S"
      onClick={handleSubmit}
      data-testid="search-btn"
    />
  )

  return (
    <OutsideClickDetector onOutsideClick={exitAutoSuggestions}>
      <div
        className={cx(styles.multiSearchWrapper, className)}
        onKeyDown={handleKeyDown}
        role="presentation"
        data-testid="multi-search"
      >
        <StyledMultiSearch
          $isFocused={isInputFocus}
          className={cx(styles.multiSearch, {
            [styles.isFocused]: isInputFocus,
          })}
        >
          <div>
            {options.map((option) => (
              <GroupBadge
                key={option}
                type={option}
                onDelete={onDeleteOption}
                compressed={compressed}
              />
            ))}
          </div>
          <TextInput
            className={styles.multiSearchInput}
            placeholder={placeholder}
            value={value}
            onKeyDown={handleKeyDown}
            onChange={onChange}
            onFocus={() => setIsInputFocus(true)}
            onBlur={() => setIsInputFocus(false)}
            ref={inputRef}
            {...rest}
          />
          {showAutoSuggestions && !!suggestionOptions?.length && (
            <StyledAutoSuggestions
              role="presentation"
              className={styles.autoSuggestions}
              data-testid="suggestions"
            >
              {suggestions?.loading && (
                <ProgressBarLoader
                  data-testid="progress-suggestions"
                  color="primary"
                />
              )}
              <ul role="listbox">
                {suggestionOptions?.map(
                  ({ id, option, value }, index) =>
                    value && (
                      <li
                        key={id}
                        className={cx(styles.suggestion, {
                          [styles.focused]: focusedItem === index,
                        })}
                        onClick={() => handleApplySuggestion(index)}
                        role="presentation"
                        data-testid={`suggestion-item-${id}`}
                      >
                        {option && (
                          <GroupBadge
                            type={option}
                            compressed={compressed}
                            className={styles.suggestionOption}
                          />
                        )}
                        <span
                          className={styles.suggestionText}
                          data-testid="suggestion-item-text"
                        >
                          {value}
                        </span>
                        <IconButton
                          className={styles.suggestionRemoveBtn}
                          icon={CancelSlimIcon}
                          color="primary"
                          aria-label="Remove History Record"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation()
                            handleDeleteSuggestion([id])
                          }}
                          data-testid={`remove-suggestion-item-${id}`}
                        />
                      </li>
                    ),
                )}
              </ul>
              <div
                role="presentation"
                className={styles.clearHistory}
                onClick={() =>
                  handleDeleteSuggestion(
                    suggestionOptions?.map((item) => item.id),
                  )
                }
                data-testid="clear-history-btn"
              >
                <RiIcon type="EraserIcon" style={{ marginRight: 6 }} />
                <span>Clear history</span>
              </div>
            </StyledAutoSuggestions>
          )}
          {(value || !!options.length) && (
            <RiTooltip content="Reset Filters" position="bottom">
              <ActionIconButton
                icon={CancelSlimIcon}
                size="XS"
                aria-label="Reset Filters"
                onClick={onClear}
                className={styles.clearButton}
                data-testid="reset-filter-btn"
                variant="secondary"
              />
            </RiTooltip>
          )}
          {!!suggestionOptions?.length && (
            <RiTooltip
              content={suggestions?.buttonTooltipTitle}
              position="bottom"
            >
              <IconButton
                icon={SwitchIcon}
                size="S"
                aria-label={suggestions?.buttonTooltipTitle}
                onClick={() => {
                  setShowAutoSuggestions((v) => !v)
                  inputRef.current?.focus()
                }}
                data-testid="show-suggestions-btn"
              />
            </RiTooltip>
          )}
          {appendRight}
          {disableSubmit && (
            <RiTooltip
              position="top"
              anchorClassName={styles.anchorSubmitBtn}
              content="Please choose index in order to preform the search"
            >
              {SubmitBtn()}
            </RiTooltip>
          )}
          {!disableSubmit && SubmitBtn()}
        </StyledMultiSearch>
      </div>
    </OutsideClickDetector>
  )
}

export default MultiSearch
