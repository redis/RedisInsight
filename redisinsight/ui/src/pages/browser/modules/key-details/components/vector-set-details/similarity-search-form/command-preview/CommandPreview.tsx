import React from 'react'

import { CopyButton } from 'uiSrc/components/copy-button'

import { COMMAND_PREVIEW_LOADING_PLACEHOLDER } from '../similarity-search-form/constants'
import { PreviewBar, PreviewText } from './CommandPreview.styles'
import { CommandPreviewProps } from './CommandPreview.types'

const TEST_ID = 'similarity-search-command-preview'

export const CommandPreview = ({
  command,
  loading = false,
}: CommandPreviewProps) => {
  const isEmpty = command.length === 0
  // Keep showing the previous command while a refresh is in flight so the
  // preview doesn't flicker between the old text and a placeholder on every
  // keystroke. Only fall back to the placeholder on the very first load,
  // when there's nothing to show yet.
  let displayText = command
  if (isEmpty) {
    displayText = loading ? COMMAND_PREVIEW_LOADING_PLACEHOLDER : ''
  }

  return (
    <PreviewBar data-testid={TEST_ID} gap="m" align="center">
      <PreviewText title={command} data-testid={`${TEST_ID}-text`}>
        {displayText}
      </PreviewText>

      <CopyButton
        copy={command}
        disabled={isEmpty}
        data-testid={`${TEST_ID}-copy`}
        aria-label="Copy command"
      />
    </PreviewBar>
  )
}
