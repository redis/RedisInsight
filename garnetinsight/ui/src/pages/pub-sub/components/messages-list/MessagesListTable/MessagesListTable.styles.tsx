import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'

export const Wrapper = styled(Col)`
  margin: ${({ theme }) => theme.core.space.space200};
  /* 
  TODO: Remove margin-top when <InstancePageTemplate />
  don't apply custom padding to the page
  */
  margin-top: ${({ theme }) => theme.core.space.space100};
`
