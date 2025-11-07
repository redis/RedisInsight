import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'

export const StyledImagePanel = styled(Col)`
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  padding: 48px;
  max-width: 420px;
  border-radius: 8px;
`
