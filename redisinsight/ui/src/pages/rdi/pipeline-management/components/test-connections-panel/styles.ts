import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Theme } from 'uiSrc/components/base/theme/types'

export const TestConnectionContainer = styled(Col)`
  border-left: 1px solid
    ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.border.informative100};
  width: 440px;
  padding: 2.4rem;
`
