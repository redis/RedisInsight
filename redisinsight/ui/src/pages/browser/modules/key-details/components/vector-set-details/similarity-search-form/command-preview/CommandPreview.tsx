import React from 'react'

import { CopyButton } from 'uiSrc/components/copy-button'

import { PreviewBar, PreviewText } from './CommandPreview.styles'
import { CommandPreviewProps } from './CommandPreview.types'

const LOADING_PLACEHOLDER = 'command is loading...'
const TEST_ID = 'similarity-search-command-preview'

export const CommandPreview = ({
  command,
  loading = false,
}: CommandPreviewProps) => {
  const isEmpty = command.length === 0
  const displayText = loading ? LOADING_PLACEHOLDER : isEmpty ? '' : command

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
