import cx from 'classnames'
import { map } from 'lodash'
import React, { useState } from 'react'

import { LoadingContent } from 'uiSrc/components/base/layout'
import { Table, ColumnDefinition } from 'uiSrc/components/base/layout/table'
import { formatBytes, Nullable } from 'uiSrc/utils'
import { rgb } from 'uiSrc/utils/colors'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { RiTooltip } from 'uiSrc/components'

import { ModifiedClusterNodes } from '../../ClusterDetailsPage'
import { AllIconsType, RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import styles from './styles.module.scss'

const ClusterNodesTable = ({
  nodes,
  loading,
}: {
  nodes: Nullable<ModifiedClusterNodes[]>
  loading: boolean
}) => {
  const [sort, setSort] = useState<PropertySort>({
    field: 'host',
    direction: 'asc',
  })

  const isMaxValue = (field: string, value: number) => {
    const values = map(nodes, field)
    return (
      Math.max(...values) === value &&
      values.filter((v) => v === value).length === 1
    )
  }

  const headerIconTemplate = (label: string, icon: AllIconsType) => (
    <div className={cx(styles.headerCell, styles.headerCellIcon)}>
      <RiIcon type={icon} className={styles.headerIcon} />
      <span>{label}</span>
    </div>
  )

  const columns: ColumnDefinition<ModifiedClusterNodes>[] = [
    {
      header: `${nodes?.length} Primary nodes`,
      id: 'host',
      accessorKey: 'host',
      enableSorting: true,
      cell: ({
        row: {
          original: { letter, port, color, host },
        },
      }) => (
        <>
          <div
            className={styles.nodeColor}
            data-testid={`node-color-${letter}`}
            style={{ backgroundColor: rgb(color) }}
          />
          <div className={styles.hostPort}>
            <span className={styles.nodeName} data-testid="node-letter">
              {letter}
            </span>
            <span>
              {host}:{port}
            </span>
          </div>
        </>
      ),
    },
    {
      header: () => headerIconTemplate('Commands/s', 'MeasureIconIcon'),
      id: 'opsPerSecond',
      accessorKey: 'opsPerSecond',
      enableSorting: true,
      cell: ({
        row: {
          original: { opsPerSecond: value },
        },
      }) => {
        const isMax = isMaxValue('opsPerSecond', value)
        return (
          <span
            className={cx({ [styles.maxValue]: isMax })}
            data-testid={`opsPerSecond-value${isMax ? '-max' : ''}`}
          >
            {numberWithSpaces(value)}
          </span>
        )
      },
    },
    {
      header: () => headerIconTemplate('Network Input', 'InputIconIcon'),
      id: 'networkInKbps',
      accessorKey: 'networkInKbps',
      enableSorting: true,
      cell: ({
        row: {
          original: { networkInKbps: value },
        },
      }) => {
        const isMax = isMaxValue('networkInKbps', value)
        return (
          <>
            <span
              className={cx({ [styles.maxValue]: isMax })}
              data-testid={`networkInKbps-value${isMax ? '-max' : ''}`}
            >
              {numberWithSpaces(value)}
            </span>
            <span className={styles.valueUnit}>kb/s</span>
          </>
        )
      },
    },
    {
      header: () => headerIconTemplate('Network Output', 'OutputIconIcon'),
      id: 'networkOutKbps',
      accessorKey: 'networkOutKbps',
      enableSorting: true,
      cell: ({
        row: {
          original: { networkOutKbps: value },
        },
      }) => {
        const isMax = isMaxValue('networkOutKbps', value)
        return (
          <>
            <span
              className={cx({ [styles.maxValue]: isMax })}
              data-testid={`networkOutKbps-value${isMax ? '-max' : ''}`}
            >
              {numberWithSpaces(value)}
            </span>
            <span className={styles.valueUnit}>kb/s</span>
          </>
        )
      },
    },
    {
      header: () => headerIconTemplate('Total Memory', 'MemoryIconIcon'),
      id: 'usedMemory',
      accessorKey: 'usedMemory',
      enableSorting: true,
      cell: ({
        row: {
          original: { usedMemory: value },
        },
      }) => {
        const [number, size] = formatBytes(value, 3, true)
        const isMax = isMaxValue('usedMemory', value)
        return (
          <RiTooltip
            content={`${numberWithSpaces(value)} B`}
            data-testid="usedMemory-tooltip"
          >
            <>
              <span
                className={cx({ [styles.maxValue]: isMax })}
                data-testid={`usedMemory-value${isMax ? '-max' : ''}`}
              >
                {number}
              </span>
              <span className={styles.valueUnit}>{size}</span>
            </>
          </RiTooltip>
        )
      },
    },
    {
      header: () => headerIconTemplate('Total Keys', 'KeyIconIcon'),
      id: 'totalKeys',
      accessorKey: 'totalKeys',
      enableSorting: true,
      cell: ({
        row: {
          original: { totalKeys: value },
        },
      }) => {
        const isMax = isMaxValue('totalKeys', value)
        return (
          <span
            className={cx({ [styles.maxValue]: isMax })}
            data-testid={`totalKeys-value${isMax ? '-max' : ''}`}
          >
            {numberWithSpaces(value)}
          </span>
        )
      },
    },
    {
      header: () => (
        <div className={cx(styles.headerCell, styles.headerCellIcon)}>
          <RiIcon type="UserIconIcon" className={styles.headerIcon} />
          <span>Clients</span>
        </div>
      ),
      id: 'connectedClients',
      accessorKey: 'connectedClients',
      enableSorting: true,
      cell: ({
        row: {
          original: { connectedClients: value },
        },
      }) => {
        const isMax = isMaxValue('connectedClients', value)
        return (
          <span
            className={cx({ [styles.maxValue]: isMax })}
            data-testid={`connectedClients-value${isMax ? '-max' : ''}`}
          >
            {numberWithSpaces(value)}
          </span>
        )
      },
    },
  ]

  return (
    <div className={styles.wrapper}>
      {loading && !nodes && (
        <div
          className={styles.loading}
          data-testid="primary-nodes-table-loading"
        >
          <LoadingContent lines={4} />
        </div>
      )}
      {nodes && (
        <div className={styles.tableWrapper} data-testid="primary-nodes-table">
          <Table
            columns={columns}
            data={nodes}
            defaultSorting={[
              {
                id: sort.field,
                desc: sort.direction === 'desc',
              },
            ]}
            onSortingChange={(newSort) =>
              setSort({
                field: newSort[0].id,
                direction: newSort[0].desc ? 'desc' : 'asc',
              })
            }
          />
        </div>
      )}
    </div>
  )
}

export default ClusterNodesTable
