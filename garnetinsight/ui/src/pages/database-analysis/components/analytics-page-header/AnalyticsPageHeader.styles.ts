import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'

export const HeaderContainer = styled.div`
  width: 100%;
  border-bottom: ${({ theme }) => {
    const { tabsLine } = theme.components.tabs.variants.default
    return `${tabsLine.size} solid ${tabsLine.color}`
  }};
`

export const HeaderContent = styled(Row).attrs({
  align: 'center',
  justify: 'between',
})`
  min-height: 36px;
`

export const TabsWrapper = styled.div`
  margin-bottom: -14px; /* Move it so it overlaps with the border of the tabs container */
`
