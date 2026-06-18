import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'

export const Container = styled(Col)`
  position: relative;
  width: 100%;
  height: 100%;
`

export const TabsWrapper = styled.div`
  padding: ${({ theme }) =>
    `${theme.core.space.space100} ${theme.core.space.space200}`};
  border-bottom: 1px solid
    ${({ theme }) => theme.semantic.color.border.neutral500};
`
