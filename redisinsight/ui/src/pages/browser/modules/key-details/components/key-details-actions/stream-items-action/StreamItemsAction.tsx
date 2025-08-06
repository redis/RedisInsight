import React from 'react'
import cx from 'classnames'

import { PlusInCircleIcon } from 'uiBase/icons'
import { RiIconButton, RiSecondaryButton } from 'uiBase/forms'
import { RiTooltip } from 'uiSrc/components'
import { MIDDLE_SCREEN_RESOLUTION } from 'uiSrc/constants'
import styles from '../styles.module.scss'

export interface Props {
  width: number
  title: string
  openAddItemPanel: () => void
}

const StreamItemsAction = ({ width, title, openAddItemPanel }: Props) => (
  <RiTooltip
    content={width > MIDDLE_SCREEN_RESOLUTION ? '' : title}
    position="left"
    anchorClassName={cx(styles.actionBtn, {
      [styles.withText]: width > MIDDLE_SCREEN_RESOLUTION,
    })}
  >
    <span
      className={cx(styles.actionBtn, {
        [styles.withText]: width > MIDDLE_SCREEN_RESOLUTION,
      })}
    >
      {width > MIDDLE_SCREEN_RESOLUTION ? (
        <RiSecondaryButton
          size="small"
          icon={PlusInCircleIcon}
          aria-label={title}
          onClick={openAddItemPanel}
          data-testid="add-key-value-items-btn"
        >
          {title}
        </RiSecondaryButton>
      ) : (
        <RiIconButton
          icon={PlusInCircleIcon}
          aria-label={title}
          onClick={openAddItemPanel}
          data-testid="add-key-value-items-btn"
        />
      )}
    </span>
  </RiTooltip>
)

export { StreamItemsAction }
