import React from 'react'
import cx from 'classnames'

import { DeleteIcon, PlusIcon } from 'uiBase/icons'
import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiSpacer } from 'uiBase/layout/spacer'
import { RiActionIconButton, RiIconButton } from 'uiBase/forms'
import { RiTooltip } from 'uiSrc/components'
import styles from './styles.module.scss'

export interface Props<T> {
  items: T[]
  children: (item: T, index: number) => React.ReactNode
  isClearDisabled: (item: T, index?: number) => boolean
  onClickRemove: (item: T, index?: number) => void
  onClickAdd: () => void
}

const AddMultipleFields = <T,>(props: Props<T>) => {
  const { items, children, isClearDisabled, onClickRemove, onClickAdd } = props

  const renderItem = (child: React.ReactNode, item: T, index?: number) => (
    <RiFlexItem
      key={index}
      className={cx('flexItemNoFullWidth', 'inlineFieldsNoSpace', styles.row)}
      grow
    >
      <RiRow align="center" gap="m">
        <RiFlexItem grow>{child}</RiFlexItem>
        <RiFlexItem>
          <RiTooltip content="Remove" position="left">
            <RiIconButton
              icon={DeleteIcon}
              disabled={isClearDisabled(item, index)}
              aria-label="Remove Item"
              onClick={() => onClickRemove(item, index)}
              data-testid="remove-item"
            />
          </RiTooltip>
        </RiFlexItem>
      </RiRow>
    </RiFlexItem>
  )

  return (
    <>
      {items.map((item, index) =>
        renderItem(children(item, index), item, index),
      )}
      <RiSpacer size="s" />
      <RiRow align="center" justify="end">
        <RiFlexItem>
          <RiTooltip content="Add" position="left">
            <RiActionIconButton
              variant="secondary"
              icon={PlusIcon}
              aria-label="Add new item"
              onClick={onClickAdd}
              data-testid="add-item"
            />
          </RiTooltip>
        </RiFlexItem>
      </RiRow>
    </>
  )
}

export default AddMultipleFields
