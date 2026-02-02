import styled, { css } from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'
import { type Theme } from 'uiSrc/components/base/theme/types'

// CommandHelperWrapper
export const CommandHelperWrapper = styled.div`
  height: 100%;
  border-top: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral400};
  border-left: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral400};
  border-right: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral400};
`

export const Container = styled.div`
  height: calc(100% - 34px);
  position: relative;
  width: 100%;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral200};
  text-align: left;
  letter-spacing: 0;
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.neutral600};
  border-top: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral400};
  z-index: 10;
  overflow: hidden;
`

export const Arg = styled(Row)<{ $odd?: boolean }>`
  padding: 3px 10px;
  margin: 0 -10px;

  ${({ $odd, theme }) =>
    $odd &&
    css`
      background-color: ${(theme as Theme).semantic.color.background
        .neutral100};
    `}
`

export const Badge = styled.span`
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral300};
  margin-right: 18px;
  min-width: 68px;
  text-align: center;
`

// CommandHelperHeader
export const HeaderContainer = styled(Row)`
  height: 34px;
  line-height: 34px;
  width: 100%;
  overflow: hidden;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral200};
  padding: 0 10px 0 16px;
  z-index: 10;
`

export const HeaderTitle = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  .euiIcon {
    color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.icon.primary500};
    margin-right: 8px;
  }
`

// CHSearchWrapper
export const SearchWrapper = styled.div`
  margin-bottom: 16px;
  position: relative;
  display: flex;
  gap: 6px;
`

// CHSearchInput
export const SearchInputContainer = styled.div`
  flex: 1;
`

// CHSearchFilter
export const FilterContainer = styled.div`
  height: 36px;
`

export const SelectedType = styled.span`
  max-width: 74px;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 36px;
  font-weight: 500;
  line-height: 36px;
`

export const ControlsIcon = styled.span`
  cursor: pointer;
  height: 20px;
  width: 20px;

  svg {
    color: ${({ theme }: { theme: Theme }) =>
      theme.components.typography.colors.primary};
  }
`

// CHSearchOutput
export const DefaultScreen = styled.div`
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  line-height: 21px;
`

export const Description = styled.span`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  div {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`

export const Summary = styled(Description)`
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.neutral500};

  div {
    color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.text.neutral500};
  }
`

// CHCommandInfo
export const InfoContainer = styled.div`
  font:
    normal normal 500 14px/21px Graphik,
    sans-serif;
`

export const InfoBadge = styled.span`
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral300};
`
