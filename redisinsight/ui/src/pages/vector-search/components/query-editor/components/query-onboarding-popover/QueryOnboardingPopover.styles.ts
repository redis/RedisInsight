import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'

export const Content = styled(Col)`
  max-width: 340px;
`

export const Section = styled(Col)`
  gap: ${({ theme }) => theme.core.space.space025};
`
