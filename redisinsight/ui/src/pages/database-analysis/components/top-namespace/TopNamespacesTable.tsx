import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import {
  extrapolate,
  formatBytes,
  formatExtrapolation,
  formatLongName,
  Nullable,
} from 'uiSrc/utils'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { GroupBadge, RiTooltip } from 'uiSrc/components'
import { Pages } from 'uiSrc/constants'
import {
  changeSearchMode,
  fetchKeys,
  keysSelector,
  resetKeysData,
  setFilter,
  setSearchMatch,
} from 'uiSrc/slices/browser/keys'
import {
  SCAN_COUNT_DEFAULT,
  SCAN_TREE_COUNT_DEFAULT,
} from 'uiSrc/constants/api'
import { KeyViewType, SearchMode } from 'uiSrc/slices/interfaces/keys'
import {
  resetBrowserTree,
  setBrowserKeyListDataLoaded,
  setBrowserTreeDelimiter,
} from 'uiSrc/slices/app/context'
import { TableTextBtn } from 'uiSrc/pages/database-analysis/components/base/TableTextBtn'
import { Table, ColumnDef } from 'uiSrc/components/base/layout/table'
import { CellText } from 'uiSrc/components/auto-discover'
import { NspSummary } from 'apiSrc/modules/database-analysis/models'

import { ExpandedRowItem, TruncatedContent } from './TopNamespace.styles'

export interface Props {
  data: Nullable<NspSummary[]>
  defaultSortField: string
  delimiter: string
  isExtrapolated: boolean
  extrapolation: number
  dataTestid?: string
}

const NameSpacesTable = ({
  data = [],
  defaultSortField,
  delimiter,
  isExtrapolated,
  extrapolation,
  dataTestid = '',
}: Props) => {
  const history = useHistory()
  const dispatch = useDispatch()

  const { instanceId } = useParams<{ instanceId: string }>()

  const { viewType } = useSelector(keysSelector)

  const handleRedirect = (nsp: string, filter: string | null) => {
    dispatch(changeSearchMode(SearchMode.Pattern))
    dispatch(setBrowserTreeDelimiter([{ label: delimiter }]))
    dispatch(setFilter(filter))
    dispatch(setSearchMatch(`${nsp}${delimiter}*`, SearchMode.Pattern))
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
    history.push(Pages.browser(instanceId))
  }

  const expandedRow = (item: NspSummary) => (
    <div>
      {item.types.map((type, index) => {
        const extrapolated = extrapolate(type.memory, {
          apply: isExtrapolated,
          extrapolation,
          showPrefix: false,
        })
        const [number, size] = formatBytes(extrapolated as number, 3, true)
        const formatNumber = formatExtrapolation(number, isExtrapolated)

        return (
          <ExpandedRowItem
            key={type.type}
            data-testid={`expanded-${item.nsp}-${index}`}
          >
            <TruncatedContent>
              <RiTooltip
                title="Key Pattern"
                position="bottom"
                content={`${item.nsp}:*`}
              >
                <TableTextBtn
                  $expanded
                  onClick={() => handleRedirect(item.nsp as string, type.type)}
                >
                  {`${item.nsp}${delimiter}*`}
                </TableTextBtn>
              </RiTooltip>
            </TruncatedContent>
            <div>
              <GroupBadge type={type.type} />
            </div>
            <div>
              <CellText data-testid="usedMemory-value">
                {formatNumber} {size}
              </CellText>
            </div>
            <div>
              <CellText>
                {extrapolate(
                  type.keys,
                  { extrapolation, apply: isExtrapolated },
                  (val: number) => numberWithSpaces(Math.round(val)),
                )}
              </CellText>
            </div>
          </ExpandedRowItem>
        )
      })}
    </div>
  )

  const columns: ColumnDef<NspSummary>[] = [
    {
      header: 'Key Pattern',
      id: 'nsp',
      accessorKey: 'nsp',
      enableSorting: true,
      cell: ({
        row: {
          original: { nsp, types },
        },
      }) => {
        const filterType = types.length > 1 ? null : types[0].type
        const textWithDelimiter = `${nsp}${delimiter}*`
        const cellContent = textWithDelimiter?.substring(0, 200)
        const tooltipContent = formatLongName(textWithDelimiter)
        return (
          <RiTooltip
            title="Key Pattern"
            position="bottom"
            content={tooltipContent}
          >
            <TableTextBtn
              onClick={() => handleRedirect(nsp as string, filterType)}
            >
              {cellContent}
            </TableTextBtn>
          </RiTooltip>
        )
      },
    },
    {
      header: 'Data Type',
      id: 'types',
      accessorKey: 'types',
      cell: ({
        row: {
          original: { types: value },
        },
      }) => (
        <div>
          {value.map(({ type }) => (
            <GroupBadge key={type} type={type} />
          ))}
        </div>
      ),
    },
    {
      header: 'Total Memory',
      id: 'memory',
      accessorKey: 'memory',
      enableSorting: true,
      cell: ({
        row: {
          original: { memory: value },
        },
      }) => {
        const extrapolated = extrapolate(value, {
          apply: isExtrapolated,
          extrapolation,
          showPrefix: false,
        }) as number
        const [number, size] = formatBytes(extrapolated, 3, true)

        const formatValue = formatExtrapolation(number, isExtrapolated)
        const formatValueBytes = formatExtrapolation(
          numberWithSpaces(Math.round(extrapolated)),
          isExtrapolated,
        )

        return (
          <RiTooltip
            content={`${formatValueBytes} B`}
            data-testid="usedMemory-tooltip"
          >
            <CellText data-testid={`nsp-usedMemory-value=${value}`}>
              {formatValue} {size}
            </CellText>
          </RiTooltip>
        )
      },
    },
    {
      header: 'Total Keys',
      id: 'keys',
      accessorKey: 'keys',
      enableSorting: true,
      cell: ({
        row: {
          original: { keys: value },
        },
      }) => (
        <CellText data-testid={`keys-value-${value}`}>
          {extrapolate(
            value,
            { extrapolation, apply: isExtrapolated },
            (val: number) => numberWithSpaces(Math.round(val)),
          )}
        </CellText>
      ),
    },
    {
      id: 'expand',
      header: () => null,
      size: 40,
      cell: ({ row }) => <Table.ExpandRowButton row={row} />,
    },
  ]

  return (
    <div data-testid={dataTestid}>
      <Table
        columns={columns}
        data={data ?? []}
        defaultSorting={[
          {
            id: defaultSortField,
            desc: true,
          },
        ]}
        stripedRows
        expandRowOnClick
        getIsRowExpandable={(row) => row.types.length > 1}
        renderExpandedRow={({ original }) => expandedRow(original)}
      />
    </div>
  )
}

export default NameSpacesTable
