import React from 'react'

import { ColumnDef } from 'uiSrc/components/base/layout/table'
import { VectorSetElement } from 'uiSrc/slices/interfaces'
import {
  bufferToString,
  createDeleteFieldHeader,
  createDeleteFieldMessage,
} from 'uiSrc/utils'
import HelpTexts from 'uiSrc/constants/help-texts'
import { Row } from 'uiSrc/components/base/layout/flex'
import { ElementNameCell } from './components/ElementNameCell/ElementNameCell'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import {
  ElementsListConfig,
  VectorSetColumn,
} from './VectorSetElementList.types'
import { VECTOR_SET_COLUMN_HEADERS } from './constants'
import * as S from './VectorSetElementList.styles'

const createNameColumn = (
  listConfig: ElementsListConfig,
): ColumnDef<VectorSetElement> => {
  const { compressor, viewFormat } = listConfig
  return {
    id: VectorSetColumn.Name,
    accessorKey: VectorSetColumn.Name,
    header: VECTOR_SET_COLUMN_HEADERS[VectorSetColumn.Name],
    enableSorting: false,
    size: 150,
    cell: ({ row }: { row: Row<VectorSetElement> }) => (
      <ElementNameCell
        element={row.original}
        compressor={compressor}
        viewFormat={viewFormat}
      />
    ),
  }
}

const createActionsColumn = (
  listConfig: ElementsListConfig,
): ColumnDef<VectorSetElement> => ({
  id: VectorSetColumn.Actions,
  header: VECTOR_SET_COLUMN_HEADERS[VectorSetColumn.Actions],
  enableSorting: false,
  size: 10,
  cell: ({ row }: { row: Row<VectorSetElement> }) => {
    const { name: nameBuffer } = row.original
    const {
      viewFormat,
      elementDeleteConfig: deleteConfig,
      onViewElement,
    } = listConfig
    const {
      deleting,
      suffix,
      total,
      keyName,
      closePopover,
      showPopover,
      handleDeleteElement,
      handleRemoveIconClick,
    } = deleteConfig

    const name = bufferToString(nameBuffer, viewFormat)

    return (
      <Row gap="s" align="center" justify="center">
        <S.StyledTextButton
          onClick={() => onViewElement(row.original)}
          data-testid={`vector-set-view-btn-${name}`}
          variant="primary-inline"
          color="informative400"
        >
          View
        </S.StyledTextButton>
        <PopoverDelete
          header={createDeleteFieldHeader(nameBuffer)}
          text={createDeleteFieldMessage(keyName)}
          item={name}
          itemRaw={nameBuffer}
          suffix={suffix}
          deleting={deleting}
          closePopover={closePopover}
          updateLoading={false}
          showPopover={showPopover}
          handleDeleteItem={handleDeleteElement}
          handleButtonClick={handleRemoveIconClick}
          testid={`vector-set-remove-btn-${name}`}
          appendInfo={total === 1 ? HelpTexts.REMOVE_LAST_ELEMENT() : null}
        />
      </Row>
    )
  },
})

export const getVectorSetColumns = (
  listConfig: ElementsListConfig,
): ColumnDef<VectorSetElement>[] => [
  createNameColumn(listConfig),
  createActionsColumn(listConfig),
]
