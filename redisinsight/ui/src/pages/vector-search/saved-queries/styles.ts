import styled from 'styled-components'

export const VectorSearchSavedQueriesContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.core.space.space150};
`

export const VectorSearchSavedQueriesSelectWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.core.space.space100};
  justify-content: space-between;
  align-items: center;
`

export const RightAlignedWrapper = styled.div`
  display: flex;
  align-self: flex-end;
`

export const TagsWrapper = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.core.space.space100};
`
