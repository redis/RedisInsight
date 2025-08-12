import styled from 'styled-components'
import { FlexGroup } from 'uiSrc/components/base/layout/flex'

export const StyledHeaderAction = styled(FlexGroup)`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.core.space.space100};
`

export const StyledWrapper = styled(FlexGroup)`
  margin-bottom: ${({ theme }) => theme.core.space.space100};
`
