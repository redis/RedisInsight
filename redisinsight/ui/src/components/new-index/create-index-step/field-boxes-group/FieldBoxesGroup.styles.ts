import styled from 'styled-components'
import { MultiBoxSelectionGroup } from '@redis-ui/components'

export const StyledFieldBoxesGroup = styled(MultiBoxSelectionGroup.Compose)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: ${({ theme }) => theme.core.space.space150};
  align-items: flex-start;
  align-self: stretch;
`
