import styled from 'styled-components'
import { Group } from 'uiSrc/components/base/layout/list'

export const DbInfoGroup = styled(Group)`
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral200};
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral400};
  padding: ${({ theme }) => theme.core.space.space100};
  border-radius: 5px;
`
