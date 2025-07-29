import { BoxSelectionGroup } from '@redis-ui/components'
import styled from 'styled-components'
import { SelectionBox } from 'uiSrc/components/new-index/selection-box'

export const SmallSelectionBox = styled(SelectionBox)`
  max-width: 228px;
`

export const LargeSelectionBox = styled(SelectionBox)`
  max-width: 424px;
`

export const StyledBoxSelectionGroup = styled(BoxSelectionGroup.Compose)`
  text-align: center;
  justify-content: flex-start;
`
