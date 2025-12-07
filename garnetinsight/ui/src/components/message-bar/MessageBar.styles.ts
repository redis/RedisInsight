import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'

export const Container = styled(Row)`
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral200};
  border-radius: 20px;
  padding: 0 25px 0 35px;
  max-width: 80%;
  min-height: 48px;
  box-shadow: ${({ theme }) => theme.core.shadow.shadow700};
`

export const ContainerWrapper = styled(Row)`
  position: absolute;
  min-width: 332px;
  min-height: 48px;
  bottom: 12px;
  width: 100%;
  z-index: 10;
`
