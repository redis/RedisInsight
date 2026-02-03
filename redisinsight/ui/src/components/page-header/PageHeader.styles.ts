import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'
import { ButtonProps, DivProps } from './PageHeader.types'

export const PageHeaderWrapper = styled(Row)<DivProps>`
  min-height: 56px;
`

export const PageHeaderTop = styled(Row)<DivProps>`
  width: 100%;
  padding: ${({ theme }) => theme.core.space.space100}
    ${({ theme }) => theme.core.space.space200};
  min-height: 70px;
`

export const LogoButton = styled.button<ButtonProps>`
  transition: transform 0.1s linear;
  padding-left: ${({ theme }) => theme.core.space.space050};
  margin-top: ${({ theme }) => theme.core.space.space150};
  background: none;
  border: none;
  cursor: pointer;

  &:hover {
    transform: translateY(-1px);
  }

  svg {
    height: 50px;
    width: 90px;
  }
`
