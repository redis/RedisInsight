import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'

export const InnerContainer = styled(Col)`
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral300};
  border-radius: ${({ theme }) => theme.core.space.space100};
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  padding: ${({ theme }) => theme.core.space.space300};
  margin: ${({ theme }) => theme.core.space.space200};
`

export const Wrapper = styled(Col)`
  margin: ${({ theme }) => theme.core.space.space200};
  /* 
  TODO: Remove margin-top when <InstancePageTemplate />
  don't apply custom padding to the page
  */
  margin-top: ${({ theme }) => theme.core.space.space100};
`
