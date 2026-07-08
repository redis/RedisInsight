import React from 'react'

import { CopyButton } from 'uiSrc/components/copy-button'

import { PreviewBar, PreviewText } from './CommandPreview.styles'
import { CommandPreviewProps } from './CommandPreview.types'

const DEFAULT_TEST_ID = 'command-preview'
const LOADING_PLACEHOLDER = 'Building command…'

/**
 * Inline single-line preview of the Redis command that the current form
 * state will dispatch. Shared across key-details verticals (Array range /
 * search / aggregate forms, Vector Set similarity search).
 */
export const CommandPreview = ({
  command,
  loading = false,
  'data-testid': dataTestId = DEFAULT_TEST_ID,
}: CommandPreviewProps) => {
  const isEmpty = command.length === 0
  let displayText = command
  if (loading) {
    displayText = LOADING_PLACEHOLDER
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
        aria-label="Copy command"
      />
    </PreviewBar>
  )
}
