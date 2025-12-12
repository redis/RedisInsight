import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'

export const HeaderContainer = styled(Row)`
  padding: ${({ theme }) => theme.core.space.space200};
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral100};
  border-bottom: 1px solid
    ${({ theme }) => theme.semantic.color.border.neutral500};
`

export const InfoItem = styled(Row).attrs(() => ({
  gap: 's',
  align: 'center',
}))``
