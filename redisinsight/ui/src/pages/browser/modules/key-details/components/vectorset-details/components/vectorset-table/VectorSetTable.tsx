import React, { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { CodeText, Text } from 'uiSrc/components/base/text'
import { RedisString } from 'uiSrc/slices/interfaces'
import {
  bufferToString,
  createDeleteFieldHeader,
  createDeleteFieldMessage,
} from 'uiSrc/utils'
import { KeyTypes } from 'uiSrc/constants'
import {
  sendEventTelemetry,
  TelemetryEvent,
  getBasedOnViewTypeEvent,
} from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  selectedKeyDataSelector,
  keysSelector,
  selectedKeySelector,
} from 'uiSrc/slices/browser/keys'
import {
  vectorsetDataSelector,
  vectorsetSelector,
  vectorsetSearchSelector,
  deleteVectorSetElements,
} from 'uiSrc/slices/browser/vectorset'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import HelpTexts from 'uiSrc/constants/help-texts'
import { AppDispatch } from 'uiSrc/slices/store'
import { Table, ColumnDef } from 'uiSrc/components/base/layout/table'
import { VectorSetSearchResult } from 'uiSrc/slices/interfaces/vectorset'
import { Row } from 'uiSrc/components/base/layout/flex'

import type {
  VectorSetTableProps,
  VectorSetDisplayItem,
} from './VectorSetTable.types'
import * as S from './VectorSetTable.styles'

const suffix = '_vectorset'

const VectorSetTable = ({
  onRemoveKey,
  isSearchMode = false,
}: VectorSetTableProps) => {
  const dispatch = useDispatch<AppDispatch>()

  const { loading } = useSelector(vectorsetSelector)
  const { elements } = useSelector(vectorsetDataSelector)
  const { results: searchResults } = useSelector(vectorsetSearchSelector)
  const { length = 0, name: key } = useSelector(selectedKeyDataSelector) ?? {}
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewType } = useSelector(keysSelector)
  const { viewFormat } = useSelector(selectedKeySelector)

  const [deleting, setDeleting] = useState('')

  const displayData = isSearchMode ? searchResults : elements

  const closePopover = useCallback(() => {
    setDeleting('')
  }, [])

  const showPopover = useCallback((elementName = '') => {
    setDeleting(`${elementName}${suffix}`)
  }, [])

  const onSuccessRemoved = useCallback(
    (newTotal: number) => {
      if (newTotal === 0) {
        onRemoveKey()
      }
      sendEventTelemetry({
        event: getBasedOnViewTypeEvent(
          viewType,
          TelemetryEvent.BROWSER_KEY_VALUE_REMOVED,
          TelemetryEvent.TREE_VIEW_KEY_VALUE_REMOVED,
        ),
        eventData: {
          databaseId: instanceId,
          keyType: KeyTypes.VectorSet,
          numberOfRemoved: 1,
        },
      })
    },
    [viewType, instanceId, onRemoveKey],
  )

  const handleDeleteElement = useCallback(
    (elementName: RedisString) => {
      if (key) {
        dispatch(deleteVectorSetElements(key, [elementName], onSuccessRemoved))
      }
      closePopover()
    },
    [key, dispatch, onSuccessRemoved, closePopover],
  )

  const handleRemoveIconClick = useCallback(() => {
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_VALUE_REMOVE_CLICKED,
        TelemetryEvent.TREE_VIEW_KEY_VALUE_REMOVE_CLICKED,
      ),
      eventData: {
        databaseId: instanceId,
        keyType: KeyTypes.VectorSet,
      },
    })
  }, [viewType, instanceId])

  const formatVector = (vector?: number[], maxDisplay = 5): string => {
    if (!vector || vector.length === 0) return '[]'
    const preview = vector.slice(0, maxDisplay).map((n) => n.toFixed(4))
    const suffixText =
      vector.length > maxDisplay ? `, ... (${vector.length})` : ''
    return `[${preview.join(', ')}${suffixText}]`
  }

  const formatAttributes = (attributes?: Record<string, unknown>): string => {
    if (!attributes || Object.keys(attributes).length === 0) return '-'
    return JSON.stringify(attributes)
  }

  const baseColumns: ColumnDef<VectorSetDisplayItem>[] = [
    {
      header: 'Element',
      id: 'name',
      accessorKey: 'name',
      cell: ({ row: { original } }) => {
        const elementName = bufferToString(original.name)
        return (
          <Text
            color="secondary"
            data-testid={`vectorset-element-${elementName}`}
          >
            {elementName}
          </Text>
        )
      },
    },
    {
      header: 'Vector',
      id: 'vector',
      accessorKey: 'vector',
      cell: ({ row: { original } }) => (
        <CodeText
          size="S"
          color="secondary"
          data-testid={`vectorset-vector-${bufferToString(original.name)}`}
        >
          {formatVector(original.vector)}
        </CodeText>
      ),
    },
    {
      header: 'Attributes',
      id: 'attributes',
      accessorKey: 'attributes',
      cell: ({ row: { original } }) => {
        const attrsValue = formatAttributes(original.attributes)
        return (
          <Text
            size="s"
            color="secondary"
            title={attrsValue}
            data-testid={`vectorset-attributes-${bufferToString(original.name)}`}
          >
            {attrsValue}
          </Text>
        )
      },
    },
    {
      header: '',
      id: 'actions',
      accessorKey: 'name',
      cell: ({ row: { original } }) => {
        const elementName = bufferToString(original.name, viewFormat)
        return (
          <Row justify="end">
            <PopoverDelete
              header={createDeleteFieldHeader(original.name)}
              text={createDeleteFieldMessage(key ?? '')}
              item={elementName}
              itemRaw={original.name}
              suffix={suffix}
              deleting={deleting}
              closePopover={closePopover}
              updateLoading={false}
              showPopover={showPopover}
              handleDeleteItem={handleDeleteElement}
              handleButtonClick={handleRemoveIconClick}
              testid={`vectorset-remove-btn-${elementName}`}
              appendInfo={length === 1 ? HelpTexts.REMOVE_LAST_ELEMENT() : null}
            />
          </Row>
        )
      },
    },
  ]

  const scoreColumn: ColumnDef<VectorSetDisplayItem> = {
    header: 'Score',
    id: 'score',
    accessorKey: 'score',
    cell: ({ row: { original } }) => {
      const score = (original as VectorSetSearchResult).score
      return (
        <Text
          color="secondary"
          data-testid={`vectorset-score-${bufferToString(original.name)}`}
        >
          {score?.toFixed(4) ?? '-'}
        </Text>
      )
    },
  }

  const columns: ColumnDef<VectorSetDisplayItem>[] = isSearchMode
    ? [baseColumns[0], scoreColumn, ...baseColumns.slice(1)]
    : baseColumns

  if (loading) {
    return null
  }

  return (
    <S.Container data-testid="vectorset-details-table">
      <Table columns={columns} data={displayData} />
    </S.Container>
  )
}

export { VectorSetTable }
