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

export const CodeBlocKWrapper = styled.div`
  overflow: auto;
  height: 100%;
  padding: 0;
  /* TODO: Remove this when <CodeBlock /> can be styled with styled() */
  padding-top: ${({ theme }) => theme.core.space.space100};

  border: 1px solid;
  border-color: ${({ theme }) => theme.color.dusk200};
  border-radius: 8px;

  background: ${({ theme }) => theme.semantic.color.background.neutral200};
  word-wrap: break-word;
  white-space: break-spaces;
`
