import styled from 'styled-components'

export const VectorSearchSavedQueriesContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.core?.space.space150};
`

export const VectorSearchSavedQueriesSelectWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.core?.space.space100};
  justify-content: space-between;
  align-items: center;
`

export const VectorSearchSavedQueryCardWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border: 1px solid;
  border-color: ${({ theme }) => theme.color?.dusk200};
  border-radius: ${({ theme }) => theme.core?.space.space100};
  padding: ${({ theme }) => theme.core?.space.space200};
  gap: ${({ theme }) => theme.core?.space.space200};
`

export const RightAlignedWrapper = styled.div`
  display: flex;
  align-self: flex-end;
`

export const TagsWrapper = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.core?.space.space100};
`
