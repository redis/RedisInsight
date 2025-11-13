import styled from 'styled-components'
import Tabs from 'uiSrc/components/base/layout/tabs'

export const StyledTabs = styled(Tabs)`
  padding: ${({ theme }) => theme.core.space.space025}
    ${({ theme }) => theme.core.space.space200} 0;
`
