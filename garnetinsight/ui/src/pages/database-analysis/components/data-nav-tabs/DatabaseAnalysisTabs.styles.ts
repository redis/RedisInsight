import styled from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'
import Tabs from 'uiSrc/components/base/layout/tabs'

export const EmptyMessageContainer = styled.div<
  React.HTMLAttributes<HTMLDivElement>
>`
  height: calc(100% - 96px);
`

export const StyledTabs = styled(Tabs)`
  padding-top: ${({ theme }: { theme: Theme }) => theme.core.space.space200};
`
