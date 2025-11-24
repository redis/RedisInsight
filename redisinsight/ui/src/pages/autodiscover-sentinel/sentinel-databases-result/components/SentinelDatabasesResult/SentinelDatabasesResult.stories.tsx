import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { SentinelMasterFactory } from 'uiSrc/mocks/factories/sentinel/SentinelMaster.factory'
import SentinelDatabasesResult from './SentinelDatabasesResult'
import {
  AddRedisDatabaseStatus,
  ModifiedSentinelMaster,
} from 'uiSrc/slices/interfaces'
import { ColumnDef } from 'uiSrc/components/base/layout/table'
import { sentinelDatabasesResultColumnsConfig } from '../../../config/SentinelDatabasesResultColumns.config'

const mastersMock: ModifiedSentinelMaster[] = [
  SentinelMasterFactory.build({
    id: '1',
    name: 'mymaster',
    status: AddRedisDatabaseStatus.Fail,
    error: {
      statusCode: 404,
      name: 'Not Found',
    },
  }),
  SentinelMasterFactory.build({
    id: '4',
    name: 'mymaster4',
    status: AddRedisDatabaseStatus.Fail,
    loading: true,
    error: {
      statusCode: 400,
      name: 'Not Found',
    },
  }),
  SentinelMasterFactory.build({
    id: '2',
    name: 'mymaster2',
    status: AddRedisDatabaseStatus.Success,
  }),
  SentinelMasterFactory.build({
    id: '3',
    name: 'mymaster3',
    status: AddRedisDatabaseStatus.Fail,
    username: 'default',
    password: 'abcde',
  }),
]

const columnsMock: ColumnDef<ModifiedSentinelMaster>[] =
  sentinelDatabasesResultColumnsConfig(
    fn(),
    fn(),
    false,
    mastersMock.filter((m) => m.status === AddRedisDatabaseStatus.Success)
      .length,
    mastersMock.length,
  )
const meta: Meta<typeof SentinelDatabasesResult> = {
  component: SentinelDatabasesResult,
  args: {
    columns: columnsMock,
    countSuccessAdded: mastersMock.filter(
      (m) => m.status === AddRedisDatabaseStatus.Success,
    ).length,
  },
}

export default meta
type Story = StoryObj<typeof SentinelDatabasesResult>

const DefaultRender = () => {
  return (
    <SentinelDatabasesResult
      onViewDatabases={fn()}
      columns={columnsMock}
      masters={mastersMock}
      countSuccessAdded={
        mastersMock.filter((m) => m.status === AddRedisDatabaseStatus.Success)
          .length
      }
      onBack={fn()}
    />
  )
}

export const Default: Story = {
  render: () => <DefaultRender />,
}

export const WithManyRows: Story = {
  render: () => {
    const mastersMock: ModifiedSentinelMaster[] = Array.from(
      { length: 100 },
      (_, i) => {
        const status = Object.values(AddRedisDatabaseStatus)[
          Math.floor(
            Math.random() * Object.values(AddRedisDatabaseStatus).length,
          )
        ]
        return SentinelMasterFactory.build({
          id: i.toString(),
          name: `mymaster${i}`,
          status,
          ...(status === AddRedisDatabaseStatus.Fail
            ? {
                error: {
                  statusCode: 404,
                  name: 'Not Found',
                },
              }
            : {}),
        })
      },
    )

    const columnsMock = sentinelDatabasesResultColumnsConfig(
      fn(),
      fn(),
      false,
      mastersMock.filter((m) => m.status === AddRedisDatabaseStatus.Success)
        .length,
      mastersMock.length,
    )

    return (
      <SentinelDatabasesResult
        onViewDatabases={fn()}
        onBack={fn()}
        columns={columnsMock}
        masters={mastersMock}
        countSuccessAdded={
          mastersMock.filter((m) => m.status === AddRedisDatabaseStatus.Success)
            .length
        }
      />
    )
  },
}

export const AllValid: Story = {
  args: {
    columns: sentinelDatabasesResultColumnsConfig(fn(), fn(), false, 1, 1),
    countSuccessAdded: 1,
    masters: [
      mastersMock.find((m) => m.status === AddRedisDatabaseStatus.Success) ||
        mastersMock[0],
    ],
    onBack: fn(),
  },
}

export const AllInvalid: Story = {
  args: {
    columns: sentinelDatabasesResultColumnsConfig(fn(), fn(), false, 0, 1),
    masters: [mastersMock[0]],
    onBack: fn(),
    countSuccessAdded: 0,
  },
}

export const Empty: Story = {
  args: {
    columns: sentinelDatabasesResultColumnsConfig(fn(), fn(), false, 0, 0),
    masters: [],
    onBack: fn(),
    countSuccessAdded: 0,
  },
}
