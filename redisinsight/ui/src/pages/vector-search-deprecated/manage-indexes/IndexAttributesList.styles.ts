import styled from 'styled-components'

export const StyledIndexAttributesList = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.core.space.space150};
  flex-direction: column;
  width: 100%;
`

export const StyledIndexSummaryInfo = styled.div`
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
`
