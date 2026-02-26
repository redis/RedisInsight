import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'

export const EmptyStateWrapper = styled.div<
  React.HTMLAttributes<HTMLDivElement>
>`
  margin-top: 40px;
  width: 100%;
`

export const EmptyStateContent = styled(Col)`
  padding: ${({ theme }) => theme.core.space.space400};
  text-align: center;
`
