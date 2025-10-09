import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'

export const StyledAppNavigation = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  background: ${({ theme }) =>
    theme.components.appBar.variants.default.bgColor};
  color: ${({ theme }) => theme.components.appBar.variants.default.color};
  height: 6rem;
  z-index: ${({ theme }) => theme.core.zIndex.zIndex5};
  box-shadow: ${({ theme }) => theme.components.appBar.boxShadow};
  box-sizing: border-box;
  align-items: center;
`
type NavContainerProps = React.ComponentProps<typeof Row> & {
  $borderLess?: boolean
}
export const StyledAppNavigationContainer = styled(Row)<NavContainerProps>`
  height: 100%;
  width: auto;
  &:first-child {
    padding-inline-start: ${({ theme }) => theme.components.appBar.group.gap};
  }
  &:last-child {
    padding-inline-end: ${({ theme }) => theme.components.appBar.group.gap};
  }

  border-bottom: ${({ theme, $borderLess }) =>
      $borderLess ? '0' : theme.components.tabs.variants.default.tabsLine.size}
    solid
    ${({ theme }) => theme.components.tabs.variants.default.tabsLine.color};
`
