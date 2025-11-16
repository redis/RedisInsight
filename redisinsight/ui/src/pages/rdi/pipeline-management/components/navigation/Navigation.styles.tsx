import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Theme } from 'uiSrc/components/base/theme/types'

// TODO: move all props to the page wrapper
export const NavigationContainer = styled(Col)`
  width: 100%;
  padding: ${({ theme }: { theme: Theme }) => theme.core.space.space300};
  border-right: 1px solid
    ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.border.informative100};
`
