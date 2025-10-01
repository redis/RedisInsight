import React from 'react'
import cx from 'classnames'
import { MIDDLE_SCREEN_RESOLUTION } from 'uiSrc/constants'
import { RiTooltip } from 'uiSrc/components'

import { PlusInCircleIcon } from 'uiSrc/components/base/icons'
import { IconButton, EmptyButton } from 'uiSrc/components/base/forms/buttons'
import styles from '../styles.module.scss'

export interface Props {
  width: number
  title: string
  openAddItemPanel: () => void
}

const AddItemsAction = ({ width, title, openAddItemPanel }: Props) => (
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
    </span>
  </RiTooltip>
)

export { AddItemsAction }
