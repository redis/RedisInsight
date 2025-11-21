import styled, { createGlobalStyle } from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'
import React from 'react'

export const Wrapper = styled.div<React.HTMLAttributes<HTMLDivElement>>`
  margin: 0 auto;
`

export const StyledSVG = styled.svg<
  React.SVGProps<SVGSVGElement> & {
    ref?: React.Ref<SVGSVGElement>
    theme: Theme
  }
>`
  --bar-fill: ${({ theme }) => theme.semantic.color.background.notice500};
  --bar-stroke: ${({ theme }) =>
    theme.semantic.color.background.informative700};

  width: 100%;
  height: 100%;
  /* D3-created bar elements */
  .bar-chart-bar {
    fill: rgb(from var(--bar-fill) r g b / 0.1);
    stroke: var(--bar-stroke);
    stroke-width: 1.5px;
  }

  /* D3-created scatter point elements */
  .bar-chart-scatter-points {
    fill: var(--bar-stroke);
    cursor: pointer;
  }

  /* D3-created dashed line elements */
  .bar-chart-dashed-line {
    stroke: ${({ theme }) => theme.semantic.color.text.neutral800};
    stroke-width: 1px;
    stroke-dasharray: 5, 3;
  }

  /* D3-created tick lines */
  .tick line {
    stroke: ${({ theme }) => theme.semantic.color.text.neutral800};
    opacity: 0.1;
  }

  /* D3-created domain */
  .domain {
    opacity: 0;
  }

  /* D3-created text elements */
  text {
    color: ${({ theme }) => theme.semantic.color.text.neutral800};
  }
`

// Tooltip is appended to body by D3, so needs global styles
export const TooltipGlobalStyles = createGlobalStyle<{ theme: Theme }>`
  .bar-chart-tooltip {
    position: fixed;
    min-width: 50px;
    background: ${({ theme }) => theme.semantic.color.background.neutral600};
    color: ${({ theme }) => theme.semantic.color.text.primary600} !important;
    z-index: 10;
    border-radius: ${({ theme }) => theme.core.space.space100};
    pointer-events: none;
    font-weight: 400;
    font-size: 12px !important;
    box-shadow: 0 3px 15px rgba(0, 0, 0, 0.2) !important;
    bottom: 0;
    height: 36px;
    min-height: 36px;
    padding: ${({ theme }) => theme.core.space.space100};
    line-height: 16px;
  }
`
