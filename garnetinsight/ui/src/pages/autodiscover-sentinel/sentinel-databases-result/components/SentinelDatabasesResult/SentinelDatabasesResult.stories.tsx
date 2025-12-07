import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { action } from 'storybook/actions'

import SentinelDatabasesResult from './SentinelDatabasesResult'
import {
  AddRedisDatabaseStatus,
  ModifiedSentinelMaster,
} from 'uiSrc/slices/interfaces'
import { ColumnDef } from 'uiSrc/components/base/layout/table'
import { colFactory } from '../../useSentinelDatabasesResultConfig'
import { fn } from 'storybook/test'
import { faker } from '@faker-js/faker'

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
    error: {
      statusCode: 404,
      name: 'Not Found',
    },
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
      onViewDatabases={action('onViewDatabases')}
      columns={columnsMock}
      masters={mastersMock}
      countSuccessAdded={
        mastersMock.filter((m) => m.status === AddRedisDatabaseStatus.Success)
          .length
      }
      onBack={action('onBack')}
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
        return {
          name: `mymaster${i}`,
          status,
          message: faker.lorem.sentence(),
          host: faker.internet.ip(),
          port: `${faker.internet.port()}`,
          numberOfSlaves: Math.floor(Math.random() * 10) + 1,
          id: i.toString(),
          alias: `mymaster${i}`,
          username: '',
          password: '',
          db: 1,
          ...(status === AddRedisDatabaseStatus.Fail
            ? {
                error: {
                  statusCode: 404,
                  name: 'Not Found',
                },
              }
            : {}),
        }
      },
    )

    const columnsMock = colFactory(
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
    columns: colFactory(
      action('onChangedInput'),
      action('onAddInstance'),
      false,
      1,
      1,
    ),
    countSuccessAdded: 1,
    masters: [
      mastersMock.find((m) => m.status === AddRedisDatabaseStatus.Success) ||
        mastersMock[0],
    ],
    onBack: action('onBack'),
  },
}

export const AllInvalid: Story = {
  args: {
    columns: colFactory(
      action('onChangedInput'),
      action('onAddInstance'),
      false,
      0,
      1,
    ),
    masters: [mastersMock[0]],
    onBack: action('onBack'),
    countSuccessAdded: 0,
  },
}

export const Empty: Story = {
  args: {
    columns: colFactory(
      action('onChangedInput'),
      action('onAddInstance'),
      false,
      0,
      0,
    ),
    masters: [],
    onBack: action('onBack'),
    countSuccessAdded: 0,
  },
}

export const NoNotificationWhenMastersAreNotProvided: Story = {
  args: {
    columns: colFactory(
      action('onChangedInput'),
      action('onAddInstance'),
      false,
      0,
      0,
    ),
    masters: [],
    onBack: action('onBack'),
    countSuccessAdded: 2,
  },
}
