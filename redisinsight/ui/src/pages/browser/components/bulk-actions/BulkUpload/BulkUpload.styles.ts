import styled from 'styled-components'
import { Col, Row } from 'uiSrc/components/base/layout/flex'

export const StyledContent = styled(Col)`
  padding: ${({ theme }) => theme.core.space.space200};
`

export const StyledFooter = styled(Row)`
  padding: 0 ${({ theme }) => theme.core.space.space200};
`
