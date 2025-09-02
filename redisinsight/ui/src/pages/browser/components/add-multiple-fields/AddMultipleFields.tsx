import React from 'react'

import { DeleteIcon, PlusIcon } from 'uiSrc/components/base/icons'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import {
  ActionIconButton,
  IconButton,
} from 'uiSrc/components/base/forms/buttons'
import { HorizontalSpacer } from 'uiSrc/components/base/layout'
import { RiTooltip } from 'uiSrc/components'
import { ItemsWrapper } from './AddMultipleFields.styles'

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
    <FlexItem key={index} grow>
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
    <Col gap="m">
      <ItemsWrapper gap="m">
        {items.map((item, index) =>
          renderItem(children(item, index), item, index),
        )}
      </ItemsWrapper>
      <Row align="center" justify="end">
        <RiTooltip content="Add" position="left">
          <ActionIconButton
            variant="secondary"
            icon={PlusIcon}
            aria-label="Add new item"
            onClick={onClickAdd}
            data-testid="add-item"
          />
        </RiTooltip>
        <HorizontalSpacer size="l" />
      </Row>
      <Spacer size="s" />
    </Col>
  )
}

export default AddMultipleFields
