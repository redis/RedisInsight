import React from 'react'

import { Table } from 'uiSrc/components/base/layout/table'

import {
  DEFAULT_CLUSTER_NODES_COLUMNS,
  DEFAULT_SORTING,
} from './ClusterNodesTable.constants'
import { ClusterNodesEmptyState } from './components/ClusterNodesEmptyState/ClusterNodesEmptyState'
import { ClusterNodesTableProps } from './ClusterNodesTable.types'

const ClusterNodesTable = ({ nodes }: ClusterNodesTableProps) => (
  <Table
    columns={DEFAULT_CLUSTER_NODES_COLUMNS}
    data={nodes}
    defaultSorting={DEFAULT_SORTING}
    emptyState={ClusterNodesEmptyState}
    maxHeight="20rem"
  />
)

export default ClusterNodesTable
