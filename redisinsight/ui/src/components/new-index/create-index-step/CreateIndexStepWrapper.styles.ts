import styled from 'styled-components'

export const StyledCreateIndexStepWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.components.boxSelectionGroup.defaultItem.gap};
`
