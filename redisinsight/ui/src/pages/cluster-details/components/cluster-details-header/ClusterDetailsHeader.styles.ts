import styled, { css } from 'styled-components'
import { Row, Col } from 'uiSrc/components/base/layout/flex'

export const Container = styled(Col)`
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral100};
`

export const Content = styled(Row)`
  padding-top: ${({ theme }) => theme.core.space.space150};
  padding-bottom: ${({ theme }) => theme.core.space.space250};
`

export const Item = styled(Col)<{ $borderLeft?: boolean }>`
  padding-right: ${({ theme }) => theme.core.space.space150};

  ${({ $borderLeft, theme }) =>
    $borderLeft &&
    css`
      border-left: 2px solid ${theme.semantic.color.border.neutral500};
      padding-left: ${theme.core.space.space150};
    `}
`

export const Loading = styled.div`
  width: 422px;
  padding-top: ${({ theme }) => theme.core.space.space200};
`
