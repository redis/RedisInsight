import type { Meta, StoryObj } from '@storybook/react-vite'

import RedisCloudDatabasesResult from './RedisCloudDatabasesResult'
import {
  RedisCloudInstanceFactory,
  RedisCloudInstanceFactorySuccess,
  RedisCloudInstanceFactoryFail,
  RedisCloudInstanceFactoryFixed,
  RedisCloudInstanceFactoryFlexible,
  RedisCloudInstanceFactoryWithModules,
  RedisCloudInstanceFactoryWithoutModules,
  RedisCloudInstanceFactoryFree,
  RedisCloudInstanceFactoryPaid,
  RedisCloudInstanceFactoryActive,
  RedisCloudInstanceFactoryPending,
  RedisCloudInstanceFactoryOptionsNone,
  RedisCloudInstanceFactoryOptionsFull,
  RedisCloudInstanceFactoryOptionsBackupSchedule,
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

const sampleInstances = RedisCloudInstanceFactory.buildList(5)
const sampleColumns = colFactory(sampleInstances, sampleInstances)
export const WithItems: Story = {
  args: {
    instances: sampleInstances,
    columns: sampleColumns,
  },
}

const successInstances = RedisCloudInstanceFactorySuccess.buildList(5)
const successColumns = colFactory(successInstances, successInstances)
export const SuccessOnly: Story = {
  args: {
    instances: successInstances,
    columns: successColumns,
  },
}

const failInstances = RedisCloudInstanceFactoryFail.buildList(5)
const failColumns = colFactory(failInstances, failInstances)
export const FailOnly: Story = {
  args: {
    instances: failInstances,
    columns: failColumns,
  },
}

const fixedInstances = RedisCloudInstanceFactoryFixed.buildList(5)
const fixedColumns = colFactory(fixedInstances, fixedInstances)
export const FixedType: Story = {
  args: {
    instances: fixedInstances,
    columns: fixedColumns,
  },
}
const flexibleInstances = RedisCloudInstanceFactoryFlexible.buildList(5)
const flexibleColumns = colFactory(flexibleInstances, flexibleInstances)
export const FlexibleType: Story = {
  args: {
    instances: flexibleInstances,
    columns: flexibleColumns,
  },
}
const withModulesInstances = RedisCloudInstanceFactoryWithModules([
  RedisDefaultModules.Search,
  RedisDefaultModules.ReJSON,
]).buildList(5)
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
const withoutModulesInstances =
  RedisCloudInstanceFactoryWithoutModules.buildList(5)
const withoutModulesColumns = colFactory(
  withoutModulesInstances,
  withoutModulesInstances,
)
export const WithoutModules: Story = {
  args: {
    instances: withoutModulesInstances,
    columns: withoutModulesColumns,
  },
}
// Free vs Paid
const freeInstances = RedisCloudInstanceFactoryFree.buildList(5)
const freeColumns = colFactory(freeInstances, freeInstances)
export const Free: Story = {
  args: {
    instances: freeInstances,
    columns: freeColumns,
  },
}
const paidInstances = RedisCloudInstanceFactoryPaid.buildList(5)
const paidColumns = colFactory(paidInstances, paidInstances)
export const Paid: Story = {
  args: {
    instances: paidInstances,
    columns: paidColumns,
  },
}

// Status variants
const activeInstances = RedisCloudInstanceFactoryActive.buildList(5)
const activeColumns = colFactory(activeInstances, activeInstances)
export const ActiveStatus: Story = {
  args: {
    instances: activeInstances,
    columns: activeColumns,
  },
}

const pendingInstances = RedisCloudInstanceFactoryPending.buildList(5)
const pendingColumns = colFactory(pendingInstances, pendingInstances)
export const PendingStatus: Story = {
  args: {
    instances: pendingInstances,
    columns: pendingColumns,
  },
}

// Options traits
const optionsNoneInstances = RedisCloudInstanceFactoryOptionsNone.buildList(5)
const optionsNoneColumns = colFactory(
  optionsNoneInstances,
  optionsNoneInstances,
)
export const OptionsNone: Story = {
  args: {
    instances: optionsNoneInstances,
    columns: optionsNoneColumns,
  },
}

const optionsFullInstances = RedisCloudInstanceFactoryOptionsFull.buildList(5)
const optionsFullColumns = colFactory(
  optionsFullInstances,
  optionsFullInstances,
)
export const OptionsFull: Story = {
  args: {
    instances: optionsFullInstances,
    columns: optionsFullColumns,
  },
}

// Backup schedule focused
const backupHourlyInstances = RedisCloudInstanceFactoryOptionsBackupSchedule(
  'snapshot-every-1-hour',
).buildList(5)
const backupHourlyColumns = colFactory(
  backupHourlyInstances,
  backupHourlyInstances,
)
export const BackupHourly: Story = {
  args: {
    instances: backupHourlyInstances,
    columns: backupHourlyColumns,
  },
}

const backup6hInstances = RedisCloudInstanceFactoryOptionsBackupSchedule(
  'snapshot-every-6-hours',
).buildList(5)
const backup6hColumns = colFactory(backup6hInstances, backup6hInstances)
export const BackupEvery6Hours: Story = {
  args: {
    instances: backup6hInstances,
    columns: backup6hColumns,
  },
}

const backup12hInstances = RedisCloudInstanceFactoryOptionsBackupSchedule(
  'snapshot-every-12-hours',
).buildList(5)
const backup12hColumns = colFactory(backup12hInstances, backup12hInstances)
export const BackupEvery12Hours: Story = {
  args: {
    instances: backup12hInstances,
    columns: backup12hColumns,
  },
}
