import styled, { css } from 'styled-components'
import { FlexGroup, FlexItem } from 'uiSrc/components/base/layout/flex'

export const VectorSearchScreenWrapper = styled(FlexGroup)`
  ${({ theme }) => css`
    margin-top: ${theme.core.space.space250};
    margin-bottom: ${theme.core.space.space250};
    background-color: ${theme.semantic.color.background.neutral100};
    border-radius: 8px;
  `}

  width: 95%;
  margin-left: auto;
  margin-right: auto;
  overflow: auto;
`

export const VectorSearchScreenHeader = styled(FlexItem)`
  padding: ${({ theme }) => theme.core.space.space300};
  justify-content: space-between;
  border: 1px solid;
  border-color: ${({ theme }) => theme.color.dusk200};
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
`

export const VectorSearchScreenContent = styled(FlexItem)`
  padding: ${({ theme }) => theme.core.space.space300};
  border-color: ${({ theme }) => theme.color.dusk200};
  gap: ${({ theme }) => theme.core.space.space550};
  border-left: 1px solid;
  border-right: 1px solid;
  border-bottom: 1px solid;
`

export const VectorSearchScreenFooter = styled(FlexItem)`
  padding: ${({ theme }) => theme.core.space.space300};
  border: 1px solid;
  border-color: ${({ theme }) => theme.color.dusk200};
  border-top: none;
  justify-content: space-between;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
`

export const VectorSearchScreenBlockWrapper = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid;
  border-color: ${({ theme }) => theme.color.dusk200};
  border-radius: ${({ theme }) => theme.core.space.space100};
  padding: ${({ theme }) => theme.core.space.space200};
  gap: ${({ theme }) => theme.core.space.space200};
`
