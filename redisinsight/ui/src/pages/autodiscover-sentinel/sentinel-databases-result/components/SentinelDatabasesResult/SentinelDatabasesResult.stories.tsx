import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { action } from 'storybook/actions'

import SentinelDatabasesResult from './SentinelDatabasesResult'
import {
  AddRedisDatabaseStatus,
  ModifiedSentinelMaster,
} from 'uiSrc/slices/interfaces'
import { ColumnDef } from 'uiSrc/components/base/layout/table'
import { getSelectionColumn } from 'uiSrc/pages/autodiscover-cloud/utils'
import { StyledContainer } from '../../../../../../../../.storybook/helpers/styles'
import { colFactory } from '../../useSentinelDatabasesResultConfig'

const meta: Meta<typeof SentinelDatabasesResult> = {
  component: SentinelDatabasesResult,
}

export default meta
type Story = StoryObj<typeof SentinelDatabasesResult>

let mastersMock: ModifiedSentinelMaster[] = [
  {
    name: 'mymaster',
    status: AddRedisDatabaseStatus.Fail,
    message: 'Lorem ipsum dolor sit.',
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
    name: 'mymaster4',
    status: AddRedisDatabaseStatus.Fail,
    loading: true,
    message: 'Lorem ipsum dolor sit.',
    host: '192.168.0.19',
    port: '6379',
    numberOfSlaves: 0,
    // nodes: [],
    id: '4',
    alias: 'mymaster4',
    username: '',
    password: '',
    db: 1,
    error: {
      statusCode: 400,
      name: 'Not Found',
    },
  },
  {
    name: 'mymaster2',
    status: AddRedisDatabaseStatus.Success,
    message: 'Yay',
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
    message: 'Lorem ipsum dolor.',
    host: '192.168.0.18',
    port: '6380',
    numberOfSlaves: 0,
    alias: 'mymaster3',
    username: 'default',
    password: 'abcde',
    db: 1,
  },
]

let columnsMock: ColumnDef<ModifiedSentinelMaster>[] = colFactory(
  action('onChangedInput'),
  action('onAddInstance'),
  false,
  mastersMock.length - 2,
  mastersMock.length,
)
const DefaultRender = () => {
  let countSuccessAdded = mastersMock.length - 2
  return (
    <StyledContainer paddingSize="m">
      <SentinelDatabasesResult
        onViewDatabases={action('onViewDatabases')}
        columns={[getSelectionColumn<ModifiedSentinelMaster>(), ...columnsMock]}
        masters={mastersMock}
        countSuccessAdded={countSuccessAdded}
        onBack={action('onBack')}
      />
    </StyledContainer>
  )
}

export const Default: Story = {
  render: () => <DefaultRender />,
}

export const Empty: Story = {
  args: {
    columns: columnsMock,
    masters: [],
    onBack: action('onBack'),
  },
}
