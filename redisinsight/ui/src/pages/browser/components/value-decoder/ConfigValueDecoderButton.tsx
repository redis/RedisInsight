import React, { useCallback } from 'react'

import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { RiTooltip } from 'uiSrc/components'

import { useValueDecoder } from './ValueDecoderProvider'
import { VALUE_DECODER_TEST_ID } from './constants'

export const ConfigValueDecoderButton = () => {
  const { openValueDecoderModal } = useValueDecoder()

  const handleOpen = useCallback(() => {
    openValueDecoderModal()
  }, [openValueDecoderModal])

  return (
    <RiTooltip
      position="top"
      content="Configure shared decoder rules for matching hash key patterns."
    >
      <EmptyButton
        size="small"
        onClick={handleOpen}
        data-testid={`${VALUE_DECODER_TEST_ID}-config-btn`}
      >
        Value Decoders
      </EmptyButton>
    </RiTooltip>
  )
}
