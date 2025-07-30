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

export const SearchInputWrapper = styled.div`
  max-width: 600px;
  display: flex;
`

export const CreateIndexStepScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid;
  border-color: ${({ theme }) => theme.color.dusk200};
  padding: ${({ theme }) => theme.core.space.space300};
  border-radius: ${({ theme }) => theme.core.space.space100};
`
