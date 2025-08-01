import styled from 'styled-components'

export const StyledIndexAttributesList = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.core.space.space150};
  flex-direction: column;
`

export const StyledIndexAttributesTable = styled.div`
  // Drawer width (60rem) minus its padding (2 * 3.2rem), we don't have them as variables in Redis UI
  width: calc(60rem - 2 * 3.2rem);
`

export const StyledIndexSummaryInfo = styled.div`
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
`
