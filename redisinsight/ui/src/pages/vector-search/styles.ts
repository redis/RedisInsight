import styled, { css } from 'styled-components'
import { FlexGroup, FlexItem } from 'uiSrc/components/base/layout/flex'

export const VectorSearchPageWrapper = styled.div`
  background-color: ${({ theme }) =>
    theme.semantic?.color.background.neutral100};
  padding: ${({ theme }) => theme.core?.space.space100}
    ${({ theme }) => theme.core?.space.space200};

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
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border: 1px solid;
  border-color: ${({ theme }) => theme.color?.dusk200};
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
`

export const VectorSearchScreenContent = styled(FlexItem)`
  gap: ${({ theme }) => theme.core?.space.space550};
  border: 1px solid;
  border-top: none;
  border-color: ${({ theme }) => theme.color?.dusk200};
`

export const VectorSearchScreenSideBarWrapper = styled(FlexItem)`
  border: 1px solid;
  border-color: ${({ theme }) => theme.color?.dusk200};
  border-top: none;
  justify-content: space-between;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
`

export const VectorSearchScreenFooter = styled(
  VectorSearchScreenSideBarWrapper,
)`
  & > :only-child {
    margin-left: auto;
  }

  align-items: center;
`

export const VectorSearchScreenBlockWrapper = styled(FlexItem)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border: 1px solid;
  border-color: ${({ theme }) => theme.color?.dusk200};
  border-radius: ${({ theme }) => theme.core?.space.space100};
  gap: ${({ theme }) => theme.core?.space.space200};
`
