import React from 'react'

import { CopyButton } from 'uiSrc/components/copy-button'

import { PreviewBar, PreviewText } from './CommandPreview.styles'
import { CommandPreviewProps } from './CommandPreview.types'

const PREVIEW_PLACEHOLDER = 'Redis Command Preview'
const TEST_ID = 'similarity-search-command-preview'

export const CommandPreview = ({ command }: CommandPreviewProps) => {
  const isEmpty = command.length === 0

  return (
    <PreviewBar data-testid={TEST_ID}>
      <PreviewText title={command} data-testid={`${TEST_ID}-text`}>
        {isEmpty ? PREVIEW_PLACEHOLDER : command}
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
