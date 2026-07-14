import React from 'react'

import { RiTooltip } from 'uiSrc/components'

import {
  SelectValueRender,
  SelectValueRenderParams,
} from 'uiSrc/components/base/forms/select/RiSelect'

import * as S from './ValueDecoderModal.styles'

export const createDescriptionSelectValueRender = (
  descriptions: Record<string, string>,
): SelectValueRender => {
  return ({ option, isOptionValue }: SelectValueRenderParams) => {
    const description = descriptions[String(option.value)] ?? ''
    const label = option.label ?? option.value

    return (
      <RiTooltip
        content={description}
        position={isOptionValue ? 'right' : 'top'}
        delay={150}
      >
        <S.SelectOptionAnchor $fullWidth={isOptionValue}>
          {label}
        </S.SelectOptionAnchor>
      </RiTooltip>
    )
  }
}
