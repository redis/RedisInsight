import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'

export const ContainerPlaceholder = styled(Col)`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.components.card.bgColor};
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
`
