import React from 'react'

import { RiTooltip } from 'uiSrc/components'
import { MIDDLE_SCREEN_RESOLUTION } from 'uiSrc/constants'
import { PlusInCircleIcon } from 'uiSrc/components/base/icons'
import {
  IconButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import * as S from '../KeyDetailsActions.styles'

export interface Props {
  width: number
  title: string
  openAddItemPanel: () => void
}

const StreamItemsAction = ({ width, title, openAddItemPanel }: Props) => (
  <S.ActionBtn $withText={width > MIDDLE_SCREEN_RESOLUTION}>
    <RiTooltip
      content={width > MIDDLE_SCREEN_RESOLUTION ? '' : title}
      position="left"
    >
      {width > MIDDLE_SCREEN_RESOLUTION ? (
        <SecondaryButton
          size="small"
          icon={PlusInCircleIcon}
          aria-label={title}
          onClick={openAddItemPanel}
          data-testid="add-key-value-items-btn"
        >
          {title}
        </SecondaryButton>
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

export { StreamItemsAction }
