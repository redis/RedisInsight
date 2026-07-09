import React, { useCallback } from 'react'

import { RiTooltip } from 'uiSrc/components'

import { useValueDecoder } from './ValueDecoderProvider'
import { VALUE_DECODER_TEST_ID } from './constants'
import * as S from './ConfigValueDecoderButton.styles'

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
      <S.ConfigButton
        size="small"
        onClick={handleOpen}
        data-testid={`${VALUE_DECODER_TEST_ID}-config-btn`}
      >
        Value Decoders
      </S.ConfigButton>
    </RiTooltip>
  )
}
