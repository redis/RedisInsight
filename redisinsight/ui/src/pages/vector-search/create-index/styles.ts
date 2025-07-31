import styled, { css } from 'styled-components'
import { FlexGroup, FlexItem } from 'uiSrc/components/base/layout/flex'

export const CreateIndexWrapper = styled(FlexGroup)`
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

export const CreateIndexHeader = styled(FlexItem)`
  ${({ theme }) => css`
    padding: ${theme.core.space.space300};
    border-color: ${theme.color.dusk200};
  `}

  justify-content: space-between;
  border: 1px solid;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
`

export const CreateIndexContent = styled(FlexItem)`
  ${({ theme }) => css`
    gap: ${theme.core.space.space550};
    padding: ${theme.core.space.space300};
    border-color: ${theme.color.dusk200};
  `}

  border-left: 1px solid;
  border-right: 1px solid;
`

export const CreateIndexFooter = styled(FlexItem)`
  ${({ theme }) => css`
    padding: ${theme.core.space.space300};
    border-color: ${theme.color.dusk200};
  `}

  border: 1px solid;
  justify-content: space-between;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
`
