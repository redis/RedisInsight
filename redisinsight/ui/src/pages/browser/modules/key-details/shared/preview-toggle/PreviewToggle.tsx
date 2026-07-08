import React from 'react'

import { RiTooltip } from 'uiSrc/components'
import { RiIcon } from 'uiSrc/components/base/icons'
import { Text } from 'uiSrc/components/base/text'

import {
  PREVIEW_COMMAND_LABEL,
  PREVIEW_LABEL,
  PREVIEW_TOGGLE_ARIA_LABEL,
  PREVIEW_TOGGLE_HIDE_TOOLTIP,
  PREVIEW_TOGGLE_SHOW_TOOLTIP,
} from './PreviewToggle.constants'
import { PreviewToggleProps } from './PreviewToggle.types'
import * as S from './PreviewToggle.styles'

/**
 * Toggle that shows/hides the inline command preview across the key-details
 * forms (Array range / search / aggregate, Vector Set similarity search).
 * The label reads "Preview command" when there's room and collapses to
 * "Preview" on narrow layouts — the caller decides via `wide` (typically fed
 * by `useResponsivePreviewLabel`).
 */
export const PreviewToggle = ({
  pressed,
  onPressedChange,
  wide = false,
  disabled = false,
  disabledTooltip,
  'data-testid': dataTestId,
}: PreviewToggleProps) => (
  <RiTooltip
    content={
      pressed
        ? PREVIEW_TOGGLE_HIDE_TOOLTIP
        : disabled && disabledTooltip
          ? disabledTooltip
          : PREVIEW_TOGGLE_SHOW_TOOLTIP
    }
    position="top"
  >
    <S.PreviewToggleButton
      pressed={pressed}
      onPressedChange={onPressedChange}
      disabled={disabled}
      aria-label={PREVIEW_TOGGLE_ARIA_LABEL}
      data-testid={dataTestId}
    >
      <RiIcon size="m" type="CliIcon" />
      <Text size="s">{wide ? PREVIEW_COMMAND_LABEL : PREVIEW_LABEL}</Text>
    </S.PreviewToggleButton>
  </RiTooltip>
)
