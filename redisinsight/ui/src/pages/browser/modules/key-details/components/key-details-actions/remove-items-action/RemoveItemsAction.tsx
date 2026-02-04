import React from 'react'

import { RiTooltip } from 'uiSrc/components'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { MinusInCircleIcon } from 'uiSrc/components/base/icons'
import * as S from '../KeyDetailsActions.styles'

export interface Props {
  title: string
  openRemoveItemPanel: () => void
}

const RemoveItemsAction = ({ title, openRemoveItemPanel }: Props) => (
  <S.ActionBtn>
    <RiTooltip content={title} position="left">
      <IconButton
        icon={MinusInCircleIcon}
        aria-label={title}
        onClick={openRemoveItemPanel}
        data-testid="remove-key-value-items-btn"
      />
    </RiTooltip>
  </S.ActionBtn>
)

export { RemoveItemsAction }
