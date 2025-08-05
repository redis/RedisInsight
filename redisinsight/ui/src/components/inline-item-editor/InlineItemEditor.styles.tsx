import React from 'react'
import styled, { css } from 'styled-components'
import { RiFlexItem, RiRow } from 'uiSrc/components/base/layout'
import { Theme } from 'uiSrc/components/base/theme/types'
import { Props } from 'uiSrc/components/inline-item-editor/InlineItemEditor'
import { RiIconButton } from 'uiSrc/components/base/forms'
import { CancelSlimIcon, CheckThinIcon } from 'uiSrc/components/base/icons'
import { RiTextInput } from '../base/inputs'

interface ContainerProps {
  className?: string
  children?: React.ReactNode
}

const RefStyledContainer = React.forwardRef(
  (
    { className, children }: ContainerProps,
    ref?: React.Ref<HTMLDivElement>,
  ) => (
    <div className={className} ref={ref}>
      {children}
    </div>
  ),
)

export const StyledContainer = styled(RefStyledContainer)`
  max-width: 100%;

  & .euiFormControlLayout {
    max-width: 100% !important;
  }

  & .tooltip {
    display: inline-block;
  }
`

export const IIEContainer = React.forwardRef<
  HTMLDivElement,
  {
    children?: React.ReactNode
  }
>(({ children, ...rest }, ref) => (
  <StyledContainer ref={ref} {...rest}>
    {children}
  </StyledContainer>
))

type ActionsContainerProps = React.ComponentProps<typeof RiRow> & {
  $position?: Props['controlsPosition']
  $design?: Props['controlsDesign']
  $width?: string
  $height?: string
}

export const DeclineButton = styled(RiIconButton).attrs({
  icon: CancelSlimIcon,
  'aria-label': 'Cancel editing',
})`
  &:hover {
    color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.text.danger500};
  }
`

export const ApplyButton = styled(RiIconButton).attrs({
  icon: CheckThinIcon,
  color: 'primary',
  'aria-label': 'Apply',
})`
  vertical-align: initial;
  &:hover:not([class*='isDisabled']) {
    color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.text.neutral500};
  }
`

const positions = {
  bottom: css`
    top: 100%;
    right: 0;
    border-radius: 0 0 10px 10px;
    box-shadow: 0 3px 3px var(--controlsBoxShadowColor);
  `,
  top: css`
    bottom: 100%;
    right: 0;
    border-radius: 10px 10px 0 0;
    box-shadow: 0 -3px 3px var(--controlsBoxShadowColor);
  `,
  right: css`
    top: 0;
    left: 100%;
    border-radius: 0 10px 10px 0;
    box-shadow: 0 3px 3px var(--controlsBoxShadowColor);
  `,
  left: css`
    top: 0;
    right: 100%;
    border-radius: 10px 0 0 10px;
    box-shadow: 0 3px 3px var(--controlsBoxShadowColor);
  `,
  inside: css`
    top: calc(100% - 35px);
    right: 7px;
    border-radius: 0 10px 10px 0;
    box-shadow: 0 3px 3px var(--controlsBoxShadowColor);
  `,
}

const designs = {
  default: css``,
  separate: css`
    border-radius: 0;
    box-shadow: none;
    background-color: inherit !important;
    text-align: right;
    width: 60px;
    z-index: 4;

    .popoverWrapper,
    ${DeclineButton}, ${ApplyButton} {
      margin: 6px 3px;
      height: 24px !important;
      width: 24px !important;
    }

    ${ApplyButton} {
      margin-top: 0;
    }

    svg {
      width: 18px !important;
      height: 18px !important;
    }
  `,
}

export const ActionsWrapper = styled(RiFlexItem)<{
  $size?: { width: string; height: string }
}>`
  width: ${({ $size }) => $size?.width ?? '24px'} !important;
  height: ${({ $size }) => $size?.height ?? '24px'} !important;
`

export const ActionsContainer = styled(RiRow)<ActionsContainerProps>`
  position: absolute;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.primary200};
  width: ${({ $width }) => $width || '80px'};
  height: ${({ $height }) => $height || '33px'};
  padding: ${({ theme }: { theme: Theme }) => theme.core.space.space050};

  z-index: 3;
  ${({ $position }) => positions[$position || 'inside']}
  ${({ $design }) => designs[$design || 'default']}
`

export const StyledTextInput = styled(RiTextInput)<{
  $width?: string
  $height?: string
}>`
  width: ${({ $width }) => $width || 'auto'};
  height: ${({ $height }) => $height || 'auto'};
  max-height: ${({ $height }) => $height || 'auto'};
  min-height: ${({ $height }) => $height || 'auto'};

  // Target the actual input element inside
  input {
    width: 100%;
    height: ${({ $height }) => $height || 'auto'};
  }
`
