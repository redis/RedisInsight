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
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { ItemsWrapper } from './AddMultipleFields.styles'

export interface ColumnLabel {
  label: string
  required?: boolean
}

export interface Props<T> {
  items: T[]
  children: (item: T, index: number) => React.ReactNode
  isClearDisabled: (item: T, index?: number) => boolean
  onClickRemove: (item: T, index?: number) => void
  onClickAdd: () => void
  /** Optional one-time header row aligned to the item columns. */
  columnLabels?: ColumnLabel[]
}

const AddMultipleFields = <T,>(props: Props<T>) => {
  const {
    items,
    children,
    isClearDisabled,
    onClickRemove,
    onClickAdd,
    columnLabels,
  } = props

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
      {columnLabels && (
        <Row align="center" gap="m" data-testid="multiple-fields-header">
          <FlexItem grow>
            <Row align="center" gap="m">
              {columnLabels.map((col) => (
                <FlexItem grow key={col.label}>
                  <FormField.Label label={col.label} required={col.required} />
                </FlexItem>
              ))}
            </Row>
          </FlexItem>
          {/* Hidden button matches the per-row remove column so the header
              stays aligned with the inputs below. */}
          <FlexItem>
            <IconButton
              icon={DeleteIcon}
              aria-hidden
              tabIndex={-1}
              disabled
              aria-label="spacer"
              style={{ visibility: 'hidden' }}
            />
          </FlexItem>
        </Row>
      )}
      <ItemsWrapper gap="m">
        {items.map((item, index) =>
          renderItem(children(item, index), item, index),
        )}
      </ItemsWrapper>
      <Row align="center" justify="end">
        <RiTooltip content="Add" position="left" delay={500}>
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
