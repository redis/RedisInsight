import React from 'react'

import { ColumnDef, Row as TableRow } from 'uiSrc/components/base/layout/table'
import { VectorSetElement } from 'uiSrc/slices/interfaces'
import {
  bufferToString,
  createDeleteFieldHeader,
  createDeleteFieldMessage,
} from 'uiSrc/utils'
import HelpTexts from 'uiSrc/constants/help-texts'
import { Row } from 'uiSrc/components/base/layout/flex'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { SearchIcon } from 'uiSrc/components/base/icons'
import { RiTooltip } from 'uiSrc/components'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import { ElementNameCell } from './components/ElementNameCell/ElementNameCell'
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
    cell: ({ row }: { row: TableRow<VectorSetElement> }) => (
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
  enableResizing: false,
  size: 100,
  sizeUnit: 'px',
  cell: ({ row }: { row: TableRow<VectorSetElement> }) => {
    const { name: nameBuffer } = row.original
    const {
      viewFormat,
      elementDeleteConfig: deleteConfig,
      onViewElement,
      onSearchByElement,
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
        <RiTooltip content="Find similar elements" position="top">
          <IconButton
            size="S"
            icon={SearchIcon}
            onClick={() => onSearchByElement(row.original)}
            aria-label="Find similar elements"
            data-testid={`vector-set-search-similar-btn-${name}`}
          />
        </RiTooltip>
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
