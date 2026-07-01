import { Tooltip } from '@redis-ui/components'

import {
  SelectValueRender,
  SelectValueRenderParams,
} from 'uiSrc/components/base/forms/select/RiSelect'

import * as S from './ValueDecoderModal.styles'

export const createDescriptionSelectValueRender = (
  descriptions: Record<string, string>,
): SelectValueRender => {
  const render = ({ option, isOptionValue }: SelectValueRenderParams) => {
    const description = descriptions[String(option.value)] ?? ''
    const label = option.label ?? option.value

    return (
      <Tooltip
        content={description}
        placement={isOptionValue ? 'right' : 'top'}
        openDelayDuration={150}
      >
        <S.SelectOptionAnchor $fullWidth={isOptionValue}>
          {label}
        </S.SelectOptionAnchor>
      </Tooltip>
    )
  }

  return render
}
