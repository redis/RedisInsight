import { isNil } from 'lodash'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'

import { GroupBadge, RiTooltip } from 'uiSrc/components'
import { Pages } from 'uiSrc/constants'
import {
  SCAN_COUNT_DEFAULT,
  SCAN_TREE_COUNT_DEFAULT,
} from 'uiSrc/constants/api'
import {
  resetBrowserTree,
  setBrowserKeyListDataLoaded,
  setBrowserSelectedKey,
  setBrowserTreeDelimiter,
} from 'uiSrc/slices/app/context'
import {
  changeSearchMode,
  fetchKeys,
  keysSelector,
  resetKeysData,
  setFilter,
  setSearchMatch,
} from 'uiSrc/slices/browser/keys'
import { KeyViewType, SearchMode } from 'uiSrc/slices/interfaces/keys'

import {
  formatBytes,
  formatLongName,
  HighlightType,
  isBigKey,
  stringToBuffer,
  truncateNumberToDuration,
  truncateNumberToFirstUnit,
  truncateTTLToSeconds,
} from 'uiSrc/utils'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { TableTextBtn } from 'uiSrc/pages/database-analysis/components/base/TableTextBtn'
import { Table, ColumnDef } from 'uiSrc/components/base/layout/table'
import { Key } from 'apiSrc/modules/database-analysis/models/key'
import { CellText } from 'uiSrc/components/auto-discover'

export interface Props {
  data: Key[]
  defaultSortField: string
  delimiter?: string
  dataTestid?: string
}

const TopKeysTable = ({
  data = [],
  defaultSortField,
  delimiter = ':',
  dataTestid = '',
}: Props) => {
  const history = useHistory()
  const dispatch = useDispatch()

  const { instanceId } = useParams<{ instanceId: string }>()

  const { viewType } = useSelector(keysSelector)

  const handleRedirect = (name: string) => {
    dispatch(changeSearchMode(SearchMode.Pattern))
    dispatch(setBrowserTreeDelimiter([{ label: delimiter }]))
    dispatch(setFilter(null))
    dispatch(setSearchMatch(name, SearchMode.Pattern))
    dispatch(resetKeysData(SearchMode.Pattern))
    dispatch(
      fetchKeys(
        {
          searchMode: SearchMode.Pattern,
          cursor: '0',
          count:
            viewType === KeyViewType.Browser
              ? SCAN_COUNT_DEFAULT
              : SCAN_TREE_COUNT_DEFAULT,
        },
        () => dispatch(setBrowserKeyListDataLoaded(SearchMode.Pattern, true)),
        () => dispatch(setBrowserKeyListDataLoaded(SearchMode.Pattern, false)),
      ),
    )
    dispatch(resetBrowserTree())
    dispatch(setBrowserSelectedKey(stringToBuffer(name)))

    history.push(Pages.browser(instanceId))
  }

  const columns: ColumnDef<Key>[] = [
    {
      header: 'Key Type',
      id: 'type',
      accessorKey: 'type',
      enableSorting: true,
      cell: ({
        row: {
          original: { type },
        },
      }) => <GroupBadge key={type} type={type} />,
    },
    {
      header: 'Key Name',
      id: 'name',
      accessorKey: 'name',
      enableSorting: true,
      minSize: 200,
      cell: ({
        row: {
          original: { name },
        },
      }) => {
        const maxLength = 35
        const nameAsString = name as string
        const tooltipContent = formatLongName(nameAsString)
        const cellContent = nameAsString.substring(0, maxLength)
        const isTruncated = nameAsString.length > maxLength
        return (
          <div data-testid="top-keys-table-name">
            <RiTooltip
              title="Key Name"
              position="bottom"
              content={tooltipContent}
            >
              <TableTextBtn onClick={() => handleRedirect(nameAsString)}>
                {`${cellContent}${isTruncated ? '...' : ''}`}
              </TableTextBtn>
            </RiTooltip>
          </div>
        )
      },
    },
    {
      header: 'TTL',
      id: 'ttl',
      accessorKey: 'ttl',
      enableSorting: true,
      cell: ({
        row: {
          original: { name, ttl: value },
        },
      }) => {
        if (isNil(value)) {
          return <CellText data-testid={`ttl-empty-${value}`}>-</CellText>
        }
        if (value === -1) {
          return (
            <CellText data-testid={`ttl-no-limit-${name}`}>No limit</CellText>
          )
        }

        return (
          <RiTooltip
            title="Time to Live"
            anchorClassName="truncateText"
            position="bottom"
            content={
              <>
                {`${truncateTTLToSeconds(value)} s`}
                <br />
                {`(${truncateNumberToDuration(value)})`}
              </>
            }
          >
            <CellText data-testid={`ttl-${name}`}>
              {truncateNumberToFirstUnit(value)}
            </CellText>
          </RiTooltip>
        )
      },
    },
    {
      header: 'Key Size',
      id: 'memory',
      accessorKey: 'memory',
      enableSorting: true,
      cell: ({
        row: {
          original: { type, memory: value },
        },
      }) => {
        if (isNil(value)) {
          return <CellText data-testid={`size-empty-${value}`}>-</CellText>
        }
        const [number, size] = formatBytes(value, 3, true)
        const isHighlight = isBigKey(type, HighlightType.Memory, value)
        return (
          <RiTooltip
            content={
              <>
                {isHighlight ? (
                  <>
                    Consider splitting it into multiple keys
                    <br />
                  </>
                ) : null}
                {numberWithSpaces(value)} B
              </>
            }
            data-testid="usedMemory-tooltip"
          >
            <CellText
              data-testid={`nsp-usedMemory-value=${value}${isHighlight ? '-highlighted' : ''}`}
            >
              {number} {size}
            </CellText>
          </RiTooltip>
        )
      },
    },
    {
      header: 'Length',
      id: 'length',
      accessorKey: 'length',
      enableSorting: true,
      cell: ({
        row: {
          original: { name, type, length: value },
        },
      }) => {
        if (isNil(value)) {
          return <CellText data-testid={`length-empty-${name}`}>-</CellText>
        }

        const isHighlight = isBigKey(type, HighlightType.Length, value)
        return (
          <RiTooltip
            content={
              isHighlight ? 'Consider splitting it into multiple keys' : ''
            }
            data-testid="usedMemory-tooltip"
          >
            <CellText
              data-testid={`length-value-${name}${isHighlight ? '-highlighted' : ''}`}
            >
              {numberWithSpaces(value)}
            </CellText>
          </RiTooltip>
        )
      },
    },
  ]

  return (
    <div data-testid={dataTestid}>
      <Table
        columns={columns}
        data={data}
        defaultSorting={[
          {
            id: defaultSortField,
            desc: true,
          },
        ]}
      />
    </div>
  )
}

export default TopKeysTable
