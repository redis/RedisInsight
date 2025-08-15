import React from 'react'
import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiIconButton } from 'uiBase/forms'
import { PlusInCircleIcon, DeleteIcon } from 'uiBase/icons'
import { RiTooltip } from 'uiBase/display'

export interface Props {
  id: number
  length: number
  index: number
  loading: boolean
  removeItem: (id: number) => void
  addItem: () => void
  anchorClassName?: string
  clearItemValues?: (id: number) => void
  clearIsDisabled?: boolean
  addItemIsDisabled?: boolean
  'data-testid'?: string
}

const AddItemsActions = (props: Props) => {
  const {
    id,
    length,
    loading,
    removeItem,
    index,
    addItem,
    anchorClassName,
    clearItemValues,
    clearIsDisabled,
    addItemIsDisabled,
    'data-testid': dataTestId,
  } = props

  const handleClick = () => {
    if (length !== 1) {
      removeItem(id)
    } else {
      clearItemValues?.(id)
    }
  }

  return (
    <RiFlexItem style={{ width: 80 }}>
      <RiRow responsive gap="m" centered>
        <div
          style={{ width: 60 }}
          className="flex-row space-between action-buttons"
        >
          {!clearIsDisabled && (
            <div>
              <RiTooltip
                content={length === 1 ? 'Clear' : 'Remove'}
                position="left"
                anchorClassName={anchorClassName}
              >
                <RiIconButton
                  icon={DeleteIcon}
                  aria-label={length === 1 ? 'Clear Item' : 'Remove Item'}
                  disabled={loading}
                  onClick={handleClick}
                  data-testid="remove-item"
                />
              </RiTooltip>
            </div>
          )}
          {index === length - 1 && (
            <div>
              <RiTooltip
                content="Add"
                position="left"
                anchorClassName={anchorClassName}
              >
                <RiIconButton
                  icon={PlusInCircleIcon}
                  disabled={loading || addItemIsDisabled}
                  aria-label="Add new item"
                  onClick={addItem}
                  data-testid={dataTestId || 'add-new-item'}
                />
              </RiTooltip>
            </div>
          )}
        </div>
      </RiRow>
    </RiFlexItem>
  )
}

export default AddItemsActions
