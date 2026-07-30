import React from 'react'

import { RiTooltip } from 'uiSrc/components'
import { RiIcon } from 'uiSrc/components/base/icons'
import { Text } from 'uiSrc/components/base/text'
import { useTranslation } from 'uiSrc/i18n'

import { PreviewToggleProps } from './PreviewToggle.types'
import * as S from './PreviewToggle.styles'

/**
 * Toggle that shows/hides the inline command preview. The label reads
 * "Preview command" when there's room and collapses to "Preview" on narrow
 * layouts — the caller decides via `wide`.
 */
export const PreviewToggle = ({
  pressed,
  onPressedChange,
  wide = false,
  disabled = false,
  disabledTooltip,
  'data-testid': dataTestId,
}: PreviewToggleProps) => {
  const { t } = useTranslation()
  return (
    <RiTooltip
      content={
        pressed
          ? t('browser.keyDetails.preview.hideTooltip')
          : disabled && disabledTooltip
            ? disabledTooltip
            : t('browser.keyDetails.preview.showTooltip')
      }
      position="top"
    >
      <S.PreviewToggleButton
        pressed={pressed}
        onPressedChange={onPressedChange}
        disabled={disabled}
        aria-label={t('browser.keyDetails.preview.toggleAria')}
        data-testid={dataTestId}
      >
        <RiIcon size="m" type="CliIcon" />
        <Text size="s">
          {wide
            ? t('browser.keyDetails.preview.commandLabel')
            : t('browser.keyDetails.preview.label')}
        </Text>
      </S.PreviewToggleButton>
    </RiTooltip>
  )
}
