import styled, { css } from 'styled-components'

export const ANCHOR_MODULE_TOOLTIP_CLASS = 'database-list-modules-anchor'

export interface StyledContainerProps {
  $unstyled?: boolean
  $highlight?: boolean
  $inCircle?: boolean
  children?: React.ReactNode
}

const highlightStyles = css`
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral300};
  border-radius: ${({ theme }) => theme.core.space.space150};
`

const inCircleStyles = css`
  height: ${({ theme }) => theme.core.space.space400};
`

const anchorModuleTooltipStyles = css`
  & .${ANCHOR_MODULE_TOOLTIP_CLASS} {
    margin-right: ${({ theme }) => theme.core.space.space200};
  }
`

export const StyledContainer = styled.div<StyledContainerProps>`
  ${({ $unstyled, $highlight, $inCircle }) =>
    !$unstyled &&
    css`
      height: ${({ theme }) => theme.core.space.space300};
      line-height: ${({ theme }) => theme.core.space.space250};
      display: inline-block;
      width: auto;
      padding-left: ${({ theme }) => theme.core.space.space050};
      padding-right: ${({ theme }) => theme.core.space.space050};

      ${$highlight && highlightStyles}

      ${$inCircle && inCircleStyles}
    `}
  ${({ $inCircle }) => $inCircle && anchorModuleTooltipStyles}
`
