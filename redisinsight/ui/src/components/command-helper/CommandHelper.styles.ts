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
  height: calc(100% - ${({ theme }: { theme: Theme }) => theme.core.space.space400});
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
  padding: ${({ theme }) => theme.core.space.space025}
    ${({ theme }) => theme.core.space.space100};
  margin: 0 ${({ theme }) => `-${theme.core.space.space100}`};

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
  margin-right: ${({ theme }) => theme.core.space.space200};
  min-width: ${({ theme }) => theme.core.space.space800};
  text-align: center;
`

// CommandHelperHeader
export const HeaderContainer = styled(Row)`
  height: ${({ theme }) => theme.core.space.space400};
  line-height: ${({ theme }) => theme.core.space.space400};
  width: 100%;
  overflow: hidden;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral200};
  padding: 0 ${({ theme }) => theme.core.space.space100} 0
    ${({ theme }) => theme.core.space.space200};
  z-index: 10;
`

export const HeaderTitle = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  .euiIcon {
    color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.icon.primary500};
    margin-right: ${({ theme }) => theme.core.space.space100};
  }
`

// Outer padding wrapper for the search area (used by CommandHelper)
export const SearchSectionWrapper = styled.div`
  padding: ${({ theme }) => theme.core.space.space100}
    ${({ theme }) => theme.core.space.space100} 0
    ${({ theme }) => theme.core.space.space100};
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral200};
`

// CHSearchWrapper - inner search controls layout
export const SearchWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.core.space.space200};
  position: relative;
  display: flex;
  gap: ${({ theme }) => theme.core.space.space050};
`

// Scrollable output area for command details and search results
export const OutputWrapper = styled.div`
  scrollbar-width: thin;
  display: flex;
  flex: 1;
  padding: 0 ${({ theme }) => theme.core.space.space100}
    ${({ theme }) => theme.core.space.space100}
    ${({ theme }) => theme.core.space.space100};
  width: 100%;
  min-width: ${({ theme }) => `calc(${theme.core.space.space600} * 5)`};
  overflow: auto;
  height: 100%;
  max-height: calc(100% - ${({ theme }) => theme.core.space.space800});
`

// CHSearchInput
export const SearchInputContainer = styled.div`
  flex: 1;
`

// CHSearchFilter
export const FilterContainer = styled.div`
  height: ${({ theme }) => theme.core.space.space400};
`

export const SelectedType = styled.span`
  max-width: ${({ theme }) => theme.core.space.space800};
  overflow: hidden;
  text-overflow: ellipsis;
  height: ${({ theme }) => theme.core.space.space400};
  font-weight: 500;
  line-height: ${({ theme }) => theme.core.space.space400};
`

export const ControlsIcon = styled.span`
  cursor: pointer;
  height: ${({ theme }) => theme.core.space.space250};
  width: ${({ theme }) => theme.core.space.space250};

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
  line-height: ${({ theme }) => theme.core.space.space250};
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
  padding: ${({ theme }) => theme.core.space.space100} 0
    ${({ theme }) => theme.core.space.space050};
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.neutral500};

  div {
    color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.text.neutral500};
  }
`

// CHCommandInfo / CommandHelper - field sections (Arguments, Since, Complexity)
export const Field = styled.div`
  padding-top: ${({ theme }) => theme.core.space.space150};
  font: ${({ theme }) =>
    `normal normal normal ${theme.core.font.fontSize.s13}/${theme.core.space.space200} Graphik, sans-serif`};
  letter-spacing: ${({ theme }) => `-${theme.core.space.space010}`};
`

export const FieldTitle = styled.span`
  font: ${({ theme }) =>
    `normal normal 500 ${theme.core.font.fontSize.s14}/${theme.core.space.space200} Graphik, sans-serif`};
  letter-spacing: ${({ theme }) => `-${theme.core.space.space010}`};
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.primary};
  padding-bottom: ${({ theme }) => theme.core.space.space025};
`

// CHCommandInfo
export const InfoContainer = styled.div`
  font: ${({ theme }) =>
    `normal normal 500 ${theme.core.font.fontSize.s14}/${theme.core.space.space250} Graphik, sans-serif`};
`

export const InfoBadge = styled.span`
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral300};
`
