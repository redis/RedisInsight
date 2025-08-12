import { TextButton } from '@redis-ui/components'
import styled from 'styled-components'
import { FlexGroup } from 'uiSrc/components/base/layout/flex'

export const StyledHeaderAction = styled(FlexGroup)`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.core.space.space100};
`

export const StyledTextButton = styled(TextButton)`
  padding: 0px;
  height: auto;
  color: ${({ theme }) => theme.color.blue400};
  &:hover {
    color: ${({ theme }) => theme.color.blue500};
  }
`

export const StyledWrapper = styled(FlexGroup)`
  margin-bottom: ${({ theme }) => theme.core.space.space100};
`
