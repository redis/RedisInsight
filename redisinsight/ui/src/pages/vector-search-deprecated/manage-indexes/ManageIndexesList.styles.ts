import styled from 'styled-components'
import { FlexGroup } from 'uiSrc/components/base/layout/flex'

export const StyledManageIndexesListAction = styled(FlexGroup)`
  flex-direction: column;
  gap: ${({ theme }) => theme.core.space.space150};
`
