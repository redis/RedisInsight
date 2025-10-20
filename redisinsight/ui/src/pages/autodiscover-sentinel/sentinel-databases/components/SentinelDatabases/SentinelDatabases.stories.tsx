import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { action } from 'storybook/actions'

import SentinelDatabases from './SentinelDatabases'
import {
  AddRedisDatabaseStatus,
  ModifiedSentinelMaster,
} from 'uiSrc/slices/interfaces'
import { ColumnDef } from 'uiSrc/components/base/layout/table'
import { getSelectionColumn } from 'uiSrc/pages/autodiscover-cloud/utils'
import { RowSelectionState } from '@redis-ui/table'
import { getRowId } from 'uiSrc/pages/autodiscover-sentinel/sentinel-databases/useSentinelDatabasesConfig'

const meta: Meta<typeof SentinelDatabases> = {
  component: SentinelDatabases,
}

export default meta
type Story = StoryObj<typeof SentinelDatabases>

let mastersMock: ModifiedSentinelMaster[] = [
  {
    name: 'mymaster',
    status: AddRedisDatabaseStatus.Fail,
    message: '',
    host: '192.168.0.19',
    port: '6379',
    numberOfSlaves: 0,
    // nodes: [],
    id: '1',
    alias: 'mymaster',
    username: '',
    password: '',
    db: 1,
  },
  {
    name: 'mymaster2',
    status: AddRedisDatabaseStatus.Success,
    message: '',
    host: '192.168.0.18',
    port: '6380',
    numberOfSlaves: 0,
    // nodes: [],
    id: '2',
    alias: 'mymaster2',
    username: '',
    password: '',
    db: 1,
  },
  {
    name: 'mymaster3',
    status: AddRedisDatabaseStatus.Fail,
    message: '',
    host: '192.168.0.18',
    port: '6380',
    numberOfSlaves: 0,
    alias: 'mymaster3',
    username: 'default',
    password: 'abcde',
    db: 1,
  },
]
let columnsMock: ColumnDef<ModifiedSentinelMaster>[] = [
  {
    header: 'Primary Group',
    id: 'name',
    accessorKey: 'name',
    enableSorting: true,
    size: 211,
  },
  {
    header: 'Database Alias*',
    id: 'alias',
    accessorKey: 'alias',
    enableSorting: true,
    size: 285,
  },
  {
    header: 'Address',
    id: 'host',
    accessorKey: 'host',
    enableSorting: true,
    size: 210,
  },
  {
    header: '# of replicas',
    id: 'numberOfSlaves',
    accessorKey: 'numberOfSlaves',
    enableSorting: true,
    size: 130,
  },
  {
    header: 'Username',
    id: 'username',
    accessorKey: 'username',
    size: 285,
  },
  {
    header: 'Password',
    id: 'password',
    accessorKey: 'password',
    size: 285,
  },
  {
    header: 'Database Index',
    id: 'db',
    accessorKey: 'db',
    size: 200,
  },
]
export const Default: Story = {
  render: () => {
    const [rowSelection, setSelection] = useState<RowSelectionState>({})
    const selection = Object.keys(rowSelection)
      .map((key) => mastersMock.find((master) => getRowId(master) === key))
      .filter(Boolean)
    console.log({ selection, rowSelection })
    return (
      <>
        <SentinelDatabases
          selection={selection || []}
          columns={[
            getSelectionColumn<ModifiedSentinelMaster>(),
            ...columnsMock,
          ]}
          masters={mastersMock}
          onClose={action('onClose')}
          onBack={action('onBack')}
          onSubmit={action('onSubmit')}
          onSelectionChange={(sel) => {
            console.log('onSelectionChange', sel)
            setSelection(sel)
          }}
        />
        <div style={{ fontSize: '1rem' }}>
          Selected rows:{' '}
          {Object.keys(rowSelection).filter((key) => rowSelection[key]).length}
          <pre>{JSON.stringify(rowSelection, null, 2)}</pre>
          <pre>{JSON.stringify(selection, null, 2)}</pre>
        </div>
      </>
    )
  },
}

export const Empty: Story = {
  args: {
    selection: [],
    columns: columnsMock,
    masters: [],
    onClose: action('onClose'),
    onBack: action('onBack'),
    onSubmit: action('onSubmit'),
    onSelectionChange: action('on selection change'),
  },
}
