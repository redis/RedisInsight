import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { action } from 'storybook/actions'

import SentinelDatabases from './SentinelDatabases'
import {
  AddRedisDatabaseStatus,
  ModifiedSentinelMaster,
} from 'uiSrc/slices/interfaces'
import { RowSelectionState } from '@redis-ui/table'
import {
  colFactory,
  getRowId,
} from 'uiSrc/pages/autodiscover-sentinel/sentinel-databases/useSentinelDatabasesConfig'

import { StyledContainer } from '../../../../../../../../.storybook/helpers/styles'

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
let columnsMock = colFactory(mastersMock, () => {})

const DefaultRender = () => {
  const [rowSelection, setSelection] = useState<RowSelectionState>({})
  const selection = Object.keys(rowSelection)
    .map((key) => mastersMock.find((master) => getRowId(master) === key))
    .filter((item): item is ModifiedSentinelMaster => Boolean(item))
  return (
    <StyledContainer paddingSize="m">
      <SentinelDatabases
        selection={selection || []}
        columns={columnsMock}
        masters={mastersMock}
        onClose={action('onClose')}
        onBack={action('onBack')}
        onSubmit={action('onSubmit')}
        onSelectionChange={(sel) => {
          setSelection(sel)
        }}
      />
    </StyledContainer>
  )
}

export const Default: Story = {
  render: () => <DefaultRender />,
}
const emptyColumnsMock = colFactory([], () => {})
export const Empty: Story = {
  args: {
    selection: [],
    columns: emptyColumnsMock,
    masters: [],
    onClose: action('onClose'),
    onBack: action('onBack'),
    onSubmit: action('onSubmit'),
    onSelectionChange: action('on selection change'),
  },
}
