import { HTMLAttributes, ReactNode } from 'react'
import styled from 'styled-components'
import { CommonProps } from 'uiBase/theme/types'

export const HorizontalSpacerSizes = ['xs', 's', 'm', 'l', 'xl', 'xxl'] as const
export type HorizontalSpacerSize = (typeof HorizontalSpacerSizes)[number]
export type HorizontalSpacerProps = CommonProps &
  HTMLAttributes<HTMLDivElement> & {
    children?: ReactNode
    size?: HorizontalSpacerSize
  }

export const horizontalSpacerStyles = {
  xs: 'var(--size-xs)',
  s: 'var(--size-s)',
  m: 'var(--size-m)',
  l: 'var(--size-l)',
  xl: 'calc(var(--base) * 2.25)',
  xxl: 'var(--size-xxl)',
}

export const StyledHorizontalSpacer = styled.div<HorizontalSpacerProps>`
  flex-shrink: 0;
  width: ${({ size = 'l' }) => horizontalSpacerStyles[size]};
  display: inline-block;
`
