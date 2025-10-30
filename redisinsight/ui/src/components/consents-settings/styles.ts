import styled from 'styled-components'
import { FlexItem } from '../base/layout/flex'

export const StyledContainer = styled(FlexItem)`
  background: ${({ theme }) => theme.semantic.color.background.neutral200};
  padding: 24px;
  border-radius: 8px;
  gap: 16px;
`
