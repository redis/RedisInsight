import React from 'react'
import styled from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'

export const Wrapper = styled.div<React.HTMLAttributes<HTMLDivElement>>`
  position: relative;
`

export const InnerTextContainer = styled.div<
  React.HTMLAttributes<HTMLDivElement>
>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`

export const Tooltip = styled.div<
  React.HTMLAttributes<HTMLDivElement> & {
    ref?: React.Ref<HTMLDivElement>
    theme: Theme
  }
>`
  position: fixed;
  background: ${({ theme }) => theme.semantic.color.background.neutral500};
  color: ${({ theme }) => theme.semantic.color.text.primary600};
  padding: ${({ theme }) => theme.core.space.space100};
  visibility: hidden;
  border-radius: ${({ theme }) => theme.core.space.space050};
  z-index: 100;
`

// SVG elements styled for d3 manipulation
// Using data attributes for styling since d3 dynamically creates these elements
export const StyledSVG = styled.svg<
  React.SVGProps<SVGSVGElement> & {
    ref?: React.Ref<SVGSVGElement>
    theme: Theme
  }
>`
  & .donut-arc {
    stroke: ${({ theme }) => theme.semantic.color.border.neutral200};
    stroke-width: 2px;
    cursor: pointer;
  }

  & .donut-label {
    fill: ${({ theme }) => theme.semantic.color.text.primary600};
    font-size: 12px;
    font-weight: bold;
    letter-spacing: -0.12px !important;

    .donut-label-value {
      font-weight: normal;
    }
  }
`
