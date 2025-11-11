import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Theme } from 'uiSrc/components/base/theme/types'

export const NavigationPanelContainer = styled(Col)`
  width: 28.4rem;
  padding: 2.4rem;
  border-right: 1px solid
    ${({ theme }: { theme: Theme }) =>
  theme.semantic.color.border.informative100};
`
