import React from 'react'

import { CopyButton } from 'uiSrc/components/copy-button'

import { PreviewBar, PreviewText } from './CommandPreview.styles'
import { CommandPreviewProps } from './CommandPreview.types'

const PREVIEW_PLACEHOLDER = 'Redis Command Preview'

export const CommandPreview = ({
  command,
  'data-testid': dataTestId = 'similarity-search-command-preview',
}: CommandPreviewProps) => {
  const isEmpty = command.length === 0

  return (
    <PreviewBar data-testid={dataTestId}>
      <PreviewText title={command} data-testid={`${dataTestId}-text`}>
        {isEmpty ? PREVIEW_PLACEHOLDER : command}
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
