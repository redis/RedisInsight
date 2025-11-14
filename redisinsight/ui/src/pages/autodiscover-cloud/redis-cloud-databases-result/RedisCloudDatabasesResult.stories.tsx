import type { Meta, StoryObj } from '@storybook/react-vite'

import RedisCloudDatabasesResult from './RedisCloudDatabasesResult'
import {
  RedisCloudInstanceFactory,
  RedisCloudInstanceFactorySuccess,
  RedisCloudInstanceFactoryFail,
  RedisCloudInstanceFactoryWithModules,
  RedisCloudInstanceFactoryOptionsFull,
} from 'uiSrc/mocks/factories/cloud/RedisCloudInstance.factory'
import { colFactory } from './utils/colFactory'
import { RedisDefaultModules } from 'uiSrc/slices/interfaces'

const meta: Meta<typeof RedisCloudDatabasesResult> = {
  component: RedisCloudDatabasesResult,
  args: {
    instances: [],
    columns: [],
    onView: () => {},
    onBack: () => {},
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {}

const mixedInstances = RedisCloudInstanceFactory.buildList(10)
const mixedColumns = colFactory(mixedInstances, mixedInstances)
export const MixedResults: Story = {
  args: {
    instances: mixedInstances,
    columns: mixedColumns,
  },
}

const successInstances = RedisCloudInstanceFactorySuccess.buildList(8)
const successColumns = colFactory(successInstances, successInstances)
export const AllSuccess: Story = {
  args: {
    instances: successInstances,
    columns: successColumns,
  },
}

const failInstances = RedisCloudInstanceFactoryFail.buildList(8)
const failColumns = colFactory(failInstances, failInstances)
export const AllFailed: Story = {
  args: {
    instances: failInstances,
    columns: failColumns,
  },
}

const withModulesInstances = RedisCloudInstanceFactoryWithModules([
  RedisDefaultModules.Search,
  RedisDefaultModules.ReJSON,
  RedisDefaultModules.TimeSeries,
]).buildList(8)
const withModulesColumns = colFactory(
  withModulesInstances,
  withModulesInstances,
)
export const WithModules: Story = {
  args: {
    instances: withModulesInstances,
    columns: withModulesColumns,
  },
}

const withOptionsInstances = RedisCloudInstanceFactoryOptionsFull.buildList(8)
const withOptionsColumns = colFactory(
  withOptionsInstances,
  withOptionsInstances,
)
export const WithOptions: Story = {
  args: {
    instances: withOptionsInstances,
    columns: withOptionsColumns,
  },
}
