import React from 'react'

import { ColumnDef, Row as TableRow } from 'uiSrc/components/base/layout/table'
import { ArrayElement } from 'uiSrc/slices/interfaces'
import {
  bufferToString,
  createDeleteFieldHeader,
  createDeleteFieldMessage,
} from 'uiSrc/utils'
import { KeyValueFormat } from 'uiSrc/constants'
import { RedisString } from 'uiSrc/slices/interfaces/app'
import HelpTexts from 'uiSrc/constants/help-texts'
import { Row } from 'uiSrc/components/base/layout/flex'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import { EditableTextArea } from 'uiSrc/pages/browser/modules/key-details/shared'
import { ARRAY_COLUMN_HEADERS } from './constants'

export interface ArrayElementDeleteConfig {
  deleting: string
  suffix: string
  total: number
  keyName: RedisString
  closePopover: () => void
  showPopover: (item: string) => void
  handleDeleteElement: (index: number) => void
}

export interface ArrayElementEditConfig {
  editingIndex: number | null
  updateLoading: boolean
  handleEditElement: (arrayIndex: number, isEditing: boolean) => void
  handleApplyEditValue: (arrayIndex: number, value: string) => void
}

export interface ArrayElementsListConfig {
  viewFormat: KeyValueFormat
  elementDeleteConfig: ArrayElementDeleteConfig
  elementEditConfig: ArrayElementEditConfig
}

const createIndexColumn = (): ColumnDef<ArrayElement> => ({
  id: 'index',
  accessorKey: 'index',
  header: ARRAY_COLUMN_HEADERS.index,
  enableSorting: false,
  size: 120,
  sizeUnit: 'px',
  cell: ({ row }: { row: TableRow<ArrayElement> }) => (
    <span data-testid={`array-index-${row.original.index}`}>
      {row.original.index}
    </span>
  ),
})

const createValueColumn = (
  listConfig: ArrayElementsListConfig,
): ColumnDef<ArrayElement> => {
  const { viewFormat, elementEditConfig } = listConfig
  const {
    editingIndex,
    updateLoading,
    handleEditElement,
    handleApplyEditValue,
  } = elementEditConfig

  return {
    id: 'value',
    accessorKey: 'value',
    header: ARRAY_COLUMN_HEADERS.value,
    enableSorting: false,
    cell: ({ row }: { row: TableRow<ArrayElement> }) => {
      const { index, value: valueBuffer } = row.original
      const displayValue = bufferToString(valueBuffer, viewFormat)
      const isEditing = editingIndex === index

      return (
        <EditableTextArea
          field={String(index)}
          initialValue={isEditing ? displayValue : ''}
          isEditing={isEditing}
          isLoading={updateLoading}
          onEdit={(editing) => handleEditElement(index, editing)}
          onDecline={() => handleEditElement(index, false)}
          onApply={(value) => handleApplyEditValue(index, value)}
          testIdPrefix="array"
        >
          <span data-testid={`array-value-${index}`}>{displayValue}</span>
        </EditableTextArea>
      )
    },
  }
}

const createActionsColumn = (
  listConfig: ArrayElementsListConfig,
): ColumnDef<ArrayElement> => ({
  id: 'actions',
  header: ARRAY_COLUMN_HEADERS.actions,
  enableSorting: false,
  enableResizing: false,
  size: 80,
  sizeUnit: 'px',
  cell: ({ row }: { row: TableRow<ArrayElement> }) => {
    const { index, value: valueBuffer } = row.original
    const { elementDeleteConfig: deleteConfig } = listConfig
    const {
      deleting,
      suffix,
      total,
      keyName,
      closePopover,
      showPopover,
      handleDeleteElement,
    } = deleteConfig

    return (
      <Row gap="s" align="center" justify="center">
        <PopoverDelete
          header={createDeleteFieldHeader(`[${index}]`)}
          text={createDeleteFieldMessage(keyName)}
          item={String(index)}
          itemRaw={valueBuffer}
          suffix={suffix}
          deleting={deleting}
          closePopover={closePopover}
          updateLoading={false}
          showPopover={showPopover}
          handleDeleteItem={() => handleDeleteElement(index)}
          handleButtonClick={() => {}}
          testid={`array-remove-btn-${index}`}
          appendInfo={total === 1 ? HelpTexts.REMOVE_LAST_ELEMENT() : null}
        />
      </Row>
    )
  },
})

export const getArrayColumns = (
  listConfig: ArrayElementsListConfig,
): ColumnDef<ArrayElement>[] => [
  createIndexColumn(),
  createValueColumn(listConfig),
  createActionsColumn(listConfig),
]
