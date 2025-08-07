import styled, { css } from 'styled-components'
import { FlexGroup, FlexItem } from 'uiSrc/components/base/layout/flex'

export const VectorSearchPageWrapper = styled.div`
  background-color: ${({ theme }) =>
    theme.semantic?.color.background.neutral100};
  padding-left: ${({ theme }) => theme.core?.space.space200};
  padding-right: ${({ theme }) => theme.core?.space.space200};

  display: flex;
  height: 100%;
  width: 100%;
`

export const VectorSearchScreenWrapper = styled(FlexGroup)`
  ${({ theme }) => css`
    background-color: ${theme.semantic?.color.background.neutral100};
    border-radius: 8px;
  `}

  width: 100%;
  height: 100%;
  margin-left: auto;
  margin-right: auto;
  overflow: auto;
`

export const VectorSearchScreenHeader = styled(FlexItem)`
  padding: ${({ theme }) => theme.core?.space.space300};
  justify-content: space-between;
  border: 1px solid;
  border-color: ${({ theme }) => theme.color?.dusk200};
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
`

export const VectorSearchScreenContent = styled(FlexItem)`
  padding: ${({ theme }) => theme.core?.space.space300};
  gap: ${({ theme }) => theme.core?.space.space550};
  border: 1px solid;
  border-top: none;
  border-color: ${({ theme }) => theme.color?.dusk200};
`

export const VectorSearchScreenFooter = styled(FlexItem)`
  padding: ${({ theme }) => theme.core?.space.space300};
  border: 1px solid;
  border-color: ${({ theme }) => theme.color?.dusk200};
  border-top: none;
  justify-content: space-between;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
`

export const VectorSearchScreenBlockWrapper = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid;
  border-color: ${({ theme }) => theme.color?.dusk200};
  border-radius: ${({ theme }) => theme.core?.space.space100};
  padding: ${({ theme }) => theme.core?.space.space200};
  gap: ${({ theme }) => theme.core?.space.space200};
`
