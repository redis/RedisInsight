import React from 'react'

import { Table } from 'uiSrc/components/base/layout/table'

import {
  DEFAULT_CLUSTER_NODES_COLUMNS,
  DEFAULT_SORTING,
} from './ClusterNodesTable.constants'
import { ClusterNodesEmptyState } from './components/ClusterNodesEmptyState/ClusterNodesEmptyState'
import { ClusterNodesTableProps } from './ClusterNodesTable.types'
import * as S from './ClusterNodesTable.styles'

const ClusterNodesTable = ({ nodes }: ClusterNodesTableProps) => (
  <S.TableWrapper data-testid="primary-nodes-table">
    <Table
      columns={DEFAULT_CLUSTER_NODES_COLUMNS}
      data={nodes}
      defaultSorting={DEFAULT_SORTING}
      emptyState={ClusterNodesEmptyState}
      maxHeight="20rem"
    />
  </S.TableWrapper>
)

export default ClusterNodesTable
