import React, { useMemo, useState } from 'react'

import { useAppSelector } from 'uiSrc/slices/hooks'
import { dispatch } from 'uiSrc/slices/store'
import { ColumnDef, Table } from 'uiSrc/components/base/layout/table'
import { Row } from 'uiSrc/components/base/layout/flex'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { EditIcon } from 'uiSrc/components/base/icons'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import { formatLongName, lastConnectionFormat } from 'uiSrc/utils'
import {
  agentMemoryEndpointsSelector,
  deleteEndpointsAction,
} from 'uiSrc/slices/agentMemory/endpoints'
import {
  AgentMemoryBackendType,
  AgentMemoryEndpoint,
} from 'uiSrc/slices/interfaces/agentMemory'

export interface EndpointsListProps {
  onEdit: (endpoint: AgentMemoryEndpoint) => void
  onConnect: (endpoint: AgentMemoryEndpoint) => void
}

const BACKEND_TYPE_LABELS: Record<AgentMemoryBackendType, string> = {
  [AgentMemoryBackendType.Oss]: 'OSS server',
  [AgentMemoryBackendType.Cloud]: 'Redis Cloud',
}

const DELETE_SUFFIX = '_agent_memory_endpoint'

const EndpointsList = ({ onEdit, onConnect }: EndpointsListProps) => {
  const { data } = useAppSelector(agentMemoryEndpointsSelector)
  const [deletingId, setDeletingId] = useState('')

  const columns: ColumnDef<AgentMemoryEndpoint>[] = useMemo(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Name',
        enableSorting: true,
      },
      {
        id: 'url',
        accessorKey: 'url',
        header: 'URL',
        enableSorting: true,
      },
      {
        id: 'backendType',
        accessorKey: 'backendType',
        header: 'Type',
        enableSorting: true,
        cell: ({ row }) =>
          BACKEND_TYPE_LABELS[row.original.backendType] ??
          row.original.backendType,
      },
      {
        id: 'lastConnection',
        accessorKey: 'lastConnection',
        header: 'Last connection',
        enableSorting: true,
        cell: ({ row }) => lastConnectionFormat(row.original.lastConnection),
      },
      {
        id: 'controls',
        size: 100,
        enableSorting: false,
        header: '',
        cell: ({ row }) => {
          const endpoint = row.original
          return (
            <Row
              justify="end"
              align="center"
              gap="xs"
              onClick={(e) => e.stopPropagation()}
            >
              <IconButton
                icon={EditIcon}
                aria-label="Edit endpoint"
                data-testid={`edit-endpoint-${endpoint.id}`}
                onClick={() => onEdit(endpoint)}
              />
              <PopoverDelete
                header={formatLongName(endpoint.name)}
                text="will be removed from RedisInsight."
                item={endpoint.id}
                suffix={DELETE_SUFFIX}
                deleting={deletingId}
                updateLoading={false}
                closePopover={() => setDeletingId('')}
                showPopover={(item) => setDeletingId(`${item}${DELETE_SUFFIX}`)}
                testid={`delete-endpoint-${endpoint.id}`}
                handleDeleteItem={() =>
                  dispatch(
                    deleteEndpointsAction([endpoint], () => setDeletingId('')),
                  )
                }
              />
            </Row>
          )
        },
      },
    ],
    [deletingId, onEdit],
  )

  return (
    <div data-testid="agent-memory-endpoints-list">
      <Table data={data} columns={columns} stripedRows onRowClick={onConnect} />
    </div>
  )
}

export default EndpointsList
