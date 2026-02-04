import React from 'react'
import { MIDDLE_SCREEN_RESOLUTION } from 'uiSrc/constants'
import { RiTooltip } from 'uiSrc/components'

import { PlusInCircleIcon } from 'uiSrc/components/base/icons'
import { IconButton, EmptyButton } from 'uiSrc/components/base/forms/buttons'
import * as S from '../KeyDetailsActions.styles'

export interface Props {
  width: number
  title: string
  openAddItemPanel: () => void
}

const AddItemsAction = ({ width, title, openAddItemPanel }: Props) => (
  <S.ActionBtn $withText={width > MIDDLE_SCREEN_RESOLUTION}>
    <RiTooltip
      content={width > MIDDLE_SCREEN_RESOLUTION ? '' : title}
      position="left"
    >
      {width > MIDDLE_SCREEN_RESOLUTION ? (
        <EmptyButton
          size="small"
          icon={PlusInCircleIcon}
          aria-label={title}
          onClick={openAddItemPanel}
          data-testid="add-key-value-items-btn"
        >
          {title}
        </EmptyButton>
      ) : (
        <IconButton
          icon={PlusInCircleIcon}
          aria-label={title}
          onClick={openAddItemPanel}
          data-testid="add-key-value-items-btn"
        />
      )}
    </RiTooltip>
  </S.ActionBtn>
)

export { AddItemsAction }
