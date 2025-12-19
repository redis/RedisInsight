import styled, { css } from 'styled-components'

import {
  IconButton,
  type IconButtonProps,
} from 'uiSrc/components/base/forms/buttons/IconButton'
import { ColorText } from 'uiSrc/components/base/text'
import { Theme } from 'uiSrc/components/base/theme/types'
import type { ColorTextProps } from 'uiSrc/components/base/text/text.styles'

type StyledIconButtonProps = IconButtonProps & { $inCircle?: boolean }

type StyledColorTextProps = ColorTextProps & { $inCircle?: boolean }

const inCircleStyles = css`
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral300};
  border: none;
  width: ${({ theme }) => theme.core.space.space400};
  max-width: ${({ theme }) => theme.core.space.space400};
  height: ${({ theme }) => theme.core.space.space400};
  border-radius: 50%;
  padding: ${({ theme }) => theme.core.space.space050};
  margin-right: 0;

  &:hover,
  &:focus,
  &:focus-within {
    background-color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.background.neutral200};
  }
`

export const StyledIconButton = styled(IconButton)<StyledIconButtonProps>`
  margin-right: ${({ theme }) => theme.core.space.space050};

  img {
    width: ${({ theme }) => theme.core.space.space200};
    max-width: ${({ theme }) => theme.core.space.space200};
    height: ${({ theme }) => theme.core.space.space200};
  }

  ${({ $inCircle }) => $inCircle && inCircleStyles}
`

export const StyledColorText = styled(ColorText)<StyledColorTextProps>`
  margin-right: ${({ theme }) => theme.core.space.space050};
  vertical-align: text-top;

  ${({ $inCircle }) => $inCircle && inCircleStyles}
`
