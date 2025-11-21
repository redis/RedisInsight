import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import RedisCloudDatabasesResult from './RedisCloudDatabasesResult'
import {
  RedisCloudInstanceFactory,
  RedisCloudInstanceFactorySuccess,
  RedisCloudInstanceFactoryFail,
  RedisCloudInstanceFactoryWithModules,
  RedisCloudInstanceFactoryOptionsFull,
} from 'uiSrc/mocks/factories/cloud/RedisCloudInstance.factory'
import { redisCloudDatabasesResultColumns } from '../config/RedisCloudDatabasesResult.config'
import { AutoDiscoverCloudIds } from 'uiSrc/pages/autodiscover-cloud/constants/constants'
import { RedisDefaultModules } from 'uiSrc/slices/interfaces'
import type { InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import { store } from 'uiSrc/slices/store'
import { loadInstancesRedisCloudSuccess } from 'uiSrc/slices/instances/cloud'

const getFilteredColumns = (instances: any[]) => {
  const allColumns = redisCloudDatabasesResultColumns

  const shouldShowCapabilities = instances.some(
    (instance) => instance.modules?.length,
  )
  const shouldShowOptions = instances.some(
    (instance) =>
      instance.options &&
      Object.values(instance.options).filter(Boolean).length,
  )

  return allColumns.filter((col) => {
    if (col.id === AutoDiscoverCloudIds.Modules && !shouldShowCapabilities) {
      return false
    }
    if (col.id === AutoDiscoverCloudIds.Options && !shouldShowOptions) {
      return false
    }
    return true
  })
}

const createStoreDecorator = (
  instancesForOptions: InstanceRedisCloud[] = [],
) => {
  return (Story: any) => {
    store.dispatch(
      loadInstancesRedisCloudSuccess({
        data: instancesForOptions,
        credentials: null,
      }),
    )

    return <Story />
  }
}

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
const mixedColumns = getFilteredColumns(mixedInstances)
export const MixedResults: Story = {
  args: {
    instances: mixedInstances,
    columns: mixedColumns,
  },
  decorators: [createStoreDecorator(mixedInstances)],
}

const successInstances = RedisCloudInstanceFactorySuccess.buildList(8)
const successColumns = getFilteredColumns(successInstances)
export const AllSuccess: Story = {
  args: {
    instances: successInstances,
    columns: successColumns,
  },
  decorators: [createStoreDecorator(successInstances)],
}

const failInstances = RedisCloudInstanceFactoryFail.buildList(8)
const failColumns = getFilteredColumns(failInstances)
export const AllFailed: Story = {
  args: {
    instances: failInstances,
    columns: failColumns,
  },
  decorators: [createStoreDecorator(failInstances)],
}

const withModulesInstances = RedisCloudInstanceFactoryWithModules([
  RedisDefaultModules.Search,
  RedisDefaultModules.ReJSON,
  RedisDefaultModules.TimeSeries,
]).buildList(8)
const withModulesColumns = getFilteredColumns(withModulesInstances)
export const WithModules: Story = {
  args: {
    instances: withModulesInstances,
    columns: withModulesColumns,
  },
  decorators: [createStoreDecorator(withModulesInstances)],
}

const withOptionsInstances = RedisCloudInstanceFactoryOptionsFull.buildList(8)
const withOptionsColumns = getFilteredColumns(withOptionsInstances)
export const WithOptions: Story = {
  args: {
    instances: withOptionsInstances,
    columns: withOptionsColumns,
  },
  decorators: [createStoreDecorator(withOptionsInstances)],
}
