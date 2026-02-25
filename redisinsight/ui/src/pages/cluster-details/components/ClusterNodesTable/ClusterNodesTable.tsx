import React, { useCallback } from 'react'

import { Table } from 'uiSrc/components/base/layout/table'

import {
  DEFAULT_CLUSTER_NODES_COLUMNS,
  DEFAULT_SORTING,
} from './ClusterNodesTable.constants'
import { ClusterNodesEmptyState } from './components/ClusterNodesEmptyState/ClusterNodesEmptyState'
import { ClusterNodesTableProps } from './ClusterNodesTable.types'

const ClusterNodesTable = ({
  nodes,
  loading,
  dataLoaded,
}: ClusterNodesTableProps) => {
  // Only show loading skeleton on initial load, not during refresh polls
  const showLoading = loading && !dataLoaded

  const renderEmptyState = useCallback(
    () => <ClusterNodesEmptyState loading={showLoading} />,
    [showLoading],
  )

  return (
    <Table
      columns={DEFAULT_CLUSTER_NODES_COLUMNS}
      data={nodes}
      defaultSorting={DEFAULT_SORTING}
      emptyState={renderEmptyState}
      maxHeight="20rem"
    />
  )
}

export default ClusterNodesTable
