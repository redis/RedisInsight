import { HTMLAttributes } from 'react'
import styled from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'
import { Row } from 'uiSrc/components/base/layout/flex'
import { TextInput } from 'uiSrc/components/base/inputs'
import {
  ActionIconButton,
  IconButton,
} from 'uiSrc/components/base/forms/buttons'
import GroupBadge from 'uiSrc/components/group-badge'

interface StyledMultiSearchProps extends HTMLAttributes<HTMLDivElement> {
  $isFocused: boolean
}

interface StyledSuggestionProps extends HTMLAttributes<HTMLLIElement> {
  $isFocused?: boolean
}

export const StyledMultiSearch = styled(Row)<StyledMultiSearchProps>`
  border: 1px solid
    ${({ theme, $isFocused }: { theme: Theme; $isFocused: boolean }) =>
      $isFocused
        ? theme.components.input.states.focused.borderColor
        : theme.components.input.states.normal.borderColor};
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.components.input.states.normal.bgColor};
  border-radius: 4px;

  position: relative;
  flex: 1;
  height: 100%;
  padding: 5px 6px 5px 0;
  background-repeat: no-repeat;
  background-size: 0 100%;
  transition:
    box-shadow 150ms ease-in,
    background-image 150ms ease-in,
    background-size 150ms ease-in,
    background-color 150ms ease-in;
`
/**
 * Auto-suggestions dropdown container
 * Replaces: .autoSuggestions
 */
export const StyledAutoSuggestions = styled.div<React.HTMLAttributes<HTMLDivElement>>`
  background-color: ${({ theme }) => theme.components.select.dropdown.bgColor};
  border: 1px solid
    ${({ theme }) => theme.components.select.states.disabled.borderColor};
  position: absolute;
  top: calc(100% + ${({ theme }) => theme.core.space.space025});
  left: 0;
  width: 100%;
  min-width: calc(
    ${({ theme }) => theme.core.space.space550} * 4
  ); // 176px instead of hardcoded 180px

  border-radius: ${({ theme }) => theme.core.space.space050};
  z-index: 1001;
  padding: ${({ theme }) => theme.core.space.space050} 0 0;
`

export const StyledMultiSearchWrapper = styled(Row)<
  React.HTMLAttributes<HTMLDivElement>
>`
  flex: 1;
  padding-bottom: 0;
  height: 100%;
  min-height: 36px;
`

export const StyledClearHistory = styled.li<
  React.HTMLAttributes<HTMLDivElement>
>`
  border-top: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral400};
  padding: 8px 10px;
  text-align: left;

  display: flex;
  align-items: center;

  cursor: pointer;
  user-select: none;

  &:hover {
    background: ${({ theme }) =>
      theme.components.select.dropdown.option.states.highlighted.bgColor};
  }
`

export const StyledSearchInput = styled(TextInput)`
  flex: 1;
  background-color: transparent;
  max-width: 100%;
  border: none;
  height: 100%;
  padding: 0 6px 0 10px;
  background-image: none;
`

/**
 * Remove button within suggestion item
 * Replaces: .suggestionRemoveBtn
 * Note: Defined before StyledSuggestion so it can be referenced in selectors
 */
export const StyledSuggestionRemoveBtn = styled(IconButton)`
  flex-shrink: 0;
  visibility: hidden;
  pointer-events: none;
`

/**
 * Individual suggestion item in the dropdown
 * Replaces: .suggestion
 */
export const StyledSuggestion = styled.li<StyledSuggestionProps>`
  display: flex;
  align-items: center;
  text-align: left;
  padding: ${({ theme }) => theme.core.space.space050}
    ${({ theme }) => theme.core.space.space100};
  cursor: default;

  ${({ $isFocused, theme }) =>
    $isFocused &&
    `background: ${theme.components.select.dropdown.option.states.highlighted.bgColor};`}

  &:hover {
    background: ${({ theme }) =>
      theme.components.select.dropdown.option.states.highlighted.bgColor};
  }

  /* Show remove button on hover or when focused */
  &:hover ${StyledSuggestionRemoveBtn} {
    visibility: visible;
    pointer-events: auto;
  }

  ${({ $isFocused }) =>
    $isFocused &&
    `& ${StyledSuggestionRemoveBtn} { 
    visibility: visible; 
    pointer-events: auto; 
    }`}
`

/**
 * GroupBadge wrapper within suggestion item
 * Replaces: .suggestionOption
 */
export const StyledSuggestionOption = styled(GroupBadge)`
  margin-right: ${({ theme }) => theme.core.space.space100};
`

/**
 * Text content within a suggestion item
 * Replaces: .suggestionText
 */
export const StyledSuggestionText = styled.span<
  HTMLAttributes<HTMLSpanElement>
>`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  flex-grow: 1;
  line-height: 1.4;
`
/**
 * Clear/Reset filters button
 * Replaces: .clearButton
 */
export const StyledClearButton = styled(ActionIconButton)`
  margin-left: ${({ theme }) => theme.core.space.space050};
`
