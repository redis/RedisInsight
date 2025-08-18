import styled from 'styled-components'
import { RiRow } from 'uiBase/layout'

export const StyledHeaderAction = styled(RiRow).attrs({
  gap: 'm',
  justify: 'end',
})``

export const StyledWrapper = styled(RiRow)`
  margin-bottom: ${({ theme }) => theme.core.space.space100};
`
