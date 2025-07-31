import React from 'react'
import cx from 'classnames'

import { DeleteIcon, PlusIcon } from 'uiSrc/components/base/icons'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import {
  ActionIconButton,
  IconButton,
} from 'uiSrc/components/base/forms/buttons'
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
    <FlexItem
      key={index}
      className={cx('flexItemNoFullWidth', 'inlineFieldsNoSpace', styles.row)}
      grow
    >
      <Row align="center" gap="m">
        <FlexItem grow>{child}</FlexItem>
        <FlexItem>
          <RiTooltip content="Remove" position="left">
            <IconButton
              icon={DeleteIcon}
              disabled={isClearDisabled(item, index)}
              aria-label="Remove Item"
              onClick={() => onClickRemove(item, index)}
              data-testid="remove-item"
            />
          </RiTooltip>
        </FlexItem>
      </Row>
    </FlexItem>
  )

  return (
    <>
      {items.map((item, index) =>
        renderItem(children(item, index), item, index),
      )}
      <Spacer size="s" />
      <Row align="center" justify="end">
        <FlexItem>
          <RiTooltip content="Add" position="left">
            <ActionIconButton
              variant="secondary"
              icon={PlusIcon}
              aria-label="Add new item"
              onClick={onClickAdd}
              data-testid="add-item"
            />
          </RiTooltip>
        </FlexItem>
      </Row>
    </>
  )
}

export default AddMultipleFields
