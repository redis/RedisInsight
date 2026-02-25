import React from 'react'
import styled, { css } from 'styled-components'
import { useTheme } from '@redis-ui/styles'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Theme } from 'uiSrc/components/base/theme/types'
import type {
  ActionsContainerProps,
  ActionsWrapperProps,
  Design,
  Positions,
} from 'uiSrc/components/inline-item-editor/InlineItemEditor.types'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CancelSlimIcon, CheckThinIcon } from 'uiSrc/components/base/icons'
import { TextInput } from '../base/inputs'

// Above theme.core.space max (space800 = 6.4rem = 64px)
const SPACE_80PX = '70px'

const RefStyledContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>((props, ref) => <div ref={ref} {...props} />)

export const StyledContainer = styled(RefStyledContainer)`
  max-width: 100%;

  & .tooltip {
    display: inline-block;
  }
`

export const DeclineButton = styled(IconButton).attrs({
  icon: CancelSlimIcon,
  'aria-label': 'Cancel editing',
})`
  &:hover {
    color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.text.danger500};
  }
`

export const ApplyButton = styled(IconButton).attrs({
  icon: CheckThinIcon,
  color: 'primary',
  'aria-label': 'Apply',
})`
  vertical-align: top;
  &:hover:not([class*='isDisabled']) {
    color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.text.neutral500};
  }
`

export const ActionsWrapper = styled(FlexItem)<{
  $size?: { width: string; height: string }
}>`
  width: ${({ $size, theme }: ActionsWrapperProps) =>
    $size?.width ?? theme.core.space.space300};
  height: ${({ $size, theme }: ActionsWrapperProps) =>
    $size?.height ?? theme.core.space.space300};
`
const usePosition = (position: Positions = 'inside') => {
  const theme = useTheme()
  const radius = theme.components.card.borderRadius
  const shadow = theme.core.shadow.shadow200
  const positionStyles = {
    bottom: css`
      top: 100%;
      right: 0;
      border-radius: 0 0 ${radius} ${radius};
      box-shadow: ${shadow};
    `,
    top: css`
      bottom: 100%;
      right: 0;
      border-radius: ${radius} ${radius} 0 0;
      box-shadow: ${shadow};
    `,
    right: css`
      top: 0;
      left: 100%;
      height: 100%;
      border-radius: 0 ${radius} ${radius} 0;
      box-shadow: ${shadow};
      align-items: center;
    `,
    left: css`
      top: 0;
      right: 100%;
      border-radius: ${radius} 0 0 ${radius};
      box-shadow: ${shadow};
    `,
    inside: css`
      top: calc(100% - ${theme.core.space.space400});
      right: ${theme.core.space.space050};
      border-radius: 0 ${radius} ${radius} 0;
      box-shadow: ${shadow};
    `,
  }
  return positionStyles[position]
}

const useDesign = (design: Design = 'default') => {
  const theme = useTheme()
  const designStyles = {
    default: '',
    separate: css`
      border-radius: 0;
      box-shadow: none;
      background-color: inherit;
      width: ${theme.core.space.space600};
      z-index: 4;
      display: flex;
      align-items: center;
      justify-content: center;

      .popoverWrapper,
      ${DeclineButton}, ${ApplyButton} {
        height: ${theme.core.space.space300};
        width: ${theme.core.space.space300};
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      svg {
        width: ${theme.core.space.space200};
        height: ${theme.core.space.space200};
      }
    `,
  }
  return designStyles[design]
}

export const ActionsContainer = styled(Row).attrs({
  align: 'center',
})<ActionsContainerProps>`
  position: absolute;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.primary200};
  width: ${({ $width = SPACE_80PX }) => $width};
  height: ${({ $height, theme }: ActionsContainerProps & { theme: Theme }) =>
    $height ?? theme.core.space.space400};
  padding: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
  z-index: 3;
  ${({ $position = 'inside' }) => usePosition($position)}
  ${({ $design = 'default' }) => useDesign($design)}
`

export const StyledTextInput = styled(TextInput)<{
  $width?: string
  $height?: string
}>`
  width: ${({ $width }) => $width || 'auto'};
  height: ${({ $height }) => $height || 'auto'};
  max-height: ${({ $height }) => $height || 'auto'};
  min-height: ${({ $height }) => $height || 'auto'};
  padding: 0;

  // Target the actual input element inside
  input {
    width: 100%;
    height: ${({ $height }) => $height || 'auto'};
    padding: 0 ${({ theme }: { theme: Theme }) => theme.core.space.space050};
  }
`

export const KeyHiddenText = styled.p`
  display: inline-block;
  visibility: hidden;
  height: ${({ theme }: { theme: Theme }) => theme.core.space.space010};
  overflow: hidden;
  max-width: 100%;
  margin-right: ${SPACE_80PX};
  word-break: break-all;
`

export const PopoverAnchor = styled.div`
  width: 100%;
  height: 100%;
`
