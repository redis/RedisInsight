import type { AnchorHTMLAttributes, ReactNode } from 'react'
import styled, { css } from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

type SurveyLinkProps = AnchorHTMLAttributes<HTMLAnchorElement>

export const SurveyLink = styled.a<SurveyLinkProps>`
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 12px;
  color: ${(props) =>
    (props.theme as Theme).components.typography.colors.primary};
  font:
    normal normal normal 12px/18px Graphik,
    sans-serif;
  &:hover {
    background-color: ${(props) =>
      (props.theme as Theme).semantic.color.background.success500};
    color: ${(props) => (props.theme as Theme).semantic.color.text.primary500};
  }
`

export const SurveyIcon = styled.span`
  margin-right: 8px;
  width: 18px;
  height: 18px;
`

interface WrapperProps {
  $fullWidth?: boolean
  children?: ReactNode
}

export const HelperWrapper = styled.div<WrapperProps>`
  width: 100%;
  max-width: 360px;
  min-width: 230px;

  ${({ $fullWidth }) =>
    $fullWidth &&
    css`
      max-width: 100%;
    `}
`

export const MonitorWrapper = styled.div<WrapperProps>`
  width: 100%;
  max-width: 628px;
  min-width: 230px;

  ${({ $fullWidth }) =>
    $fullWidth &&
    css`
      max-width: 100%;
    `}
`
