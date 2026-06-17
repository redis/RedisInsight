import React from 'react'

import { CopyButton } from 'uiSrc/components/copy-button'

import { PreviewBar, PreviewText } from './CommandPreview.styles'
import { CommandPreviewProps } from './CommandPreview.types'

const TEST_ID = 'array-range-form-command-preview'
const LOADING_PLACEHOLDER = 'Building command…'

/**
 * Inline single-line preview of the Redis command that the current form
 * state will dispatch. Mirrors the pattern established by Vector Set's
 * similarity-search form so the look-and-feel is consistent across
 * verticals. Will be promoted to `key-details/shared/` once the Aggregate
 * and Search verticals (Tasks 4 / 5) start needing it.
 */
export const CommandPreview = ({
  command,
  loading = false,
}: CommandPreviewProps) => {
  const isEmpty = command.length === 0
  let displayText = command
  if (loading) {
    displayText = LOADING_PLACEHOLDER
  } else if (isEmpty) {
    displayText = ''
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
