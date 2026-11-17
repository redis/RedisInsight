import React from 'react'

import { CopyButton } from 'uiSrc/components/copy-button'
import { useTranslation } from 'uiSrc/i18n'

import { PreviewBar, PreviewText } from './CommandPreview.styles'
import { CommandPreviewProps } from './CommandPreview.types'

const DEFAULT_TEST_ID = 'command-preview'

/**
 * Inline single-line preview of the Redis command that the current form
 * state will dispatch.
 */
export const CommandPreview = ({
  command,
  loading = false,
  'data-testid': dataTestId = DEFAULT_TEST_ID,
}: CommandPreviewProps) => {
  const { t } = useTranslation()
  const isEmpty = command.length === 0
  let displayText = command
  if (loading) {
    displayText = t('browser.keyDetails.commandPreview.building')
  } else if (isEmpty) {
    displayText = ''
  }

  return (
    <PreviewBar data-testid={dataTestId} gap="m" align="center">
      <PreviewText title={command} data-testid={`${dataTestId}-text`}>
        {displayText}
      </PreviewText>
      <CopyButton
        copy={command}
        disabled={isEmpty}
        data-testid={`${dataTestId}-copy`}
        aria-label={t('browser.keyDetails.commandPreview.copyAria')}
      />
    </PreviewBar>
  )
}
