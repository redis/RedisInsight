import styled from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'
import { Row } from 'uiSrc/components/base/layout/flex'
import { TextInput } from 'uiSrc/components/base/inputs'

interface StyledMultiSearchProps extends React.HTMLAttributes<HTMLDivElement> {
  $isFocused: boolean
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
export const StyledAutoSuggestions = styled.div<
  React.HTMLAttributes<HTMLDivElement>
>`
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.components.select.dropdown.bgColor};
  border: 1px solid
    ${({ theme }: { theme: Theme }) =>
      theme.components.select.states.disabled.borderColor};
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  width: 100%;
  min-width: 180px;

  border-radius: 4px;
  z-index: 1001;
  padding: 4px 0 0;

  font-size: 13px;
`

export const StyledMultiSearchWrapper = styled(Row)<
  React.HTMLAttributes<HTMLDivElement>
>`
  flex: 1;
  padding-bottom: 0;
  height: 100%;
  min-height: 36px;
`

export const StyledSuggestion = styled.li<React.HTMLAttributes<HTMLLIElement>>`
  &:hover {
    background: ${({ theme }: { theme: Theme }) =>
      theme.components.select.dropdown.option.states.highlighted.bgColor};
  }
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
