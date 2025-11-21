import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import RedisCloudDatabases from './'
import { redisCloudDatabasesColumns } from '../../config/RedisCloudDatabases.config'

import { RowSelectionState } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import { RedisCloudInstanceFactory } from 'uiSrc/mocks/factories/cloud/RedisCloudInstance.factory'
import { AutoDiscoverCloudIds } from 'uiSrc/pages/autodiscover-cloud/constants/constants'

const emptyColumns = redisCloudDatabasesColumns([]).filter(
  (col) => col.id !== AutoDiscoverCloudIds.SelectionDatabases,
)

const meta: Meta<typeof RedisCloudDatabases> = {
  component: RedisCloudDatabases,
  args: {
    columns: emptyColumns,
    instances: [],
    selection: [],
    loading: true,
    onSubmit: () => {},
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {}

const RenderStory = () => {
  const instancesMock: InstanceRedisCloud[] =
    RedisCloudInstanceFactory.buildList(6)
  const columns = redisCloudDatabasesColumns(instancesMock)
  const [selection, setSelection] = useState<InstanceRedisCloud[]>([])

  const handleSelectionChange = (currentSelected: RowSelectionState) => {
    const newSelection = instancesMock.filter((item) => {
      const { id } = item
      if (!id) {
        return false
      }
      return currentSelected[id]
    })
    setSelection(newSelection)
  }

  return (
    <RedisCloudDatabases
      loading={false}
      instances={instancesMock}
      onClose={fn()}
      onBack={fn()}
      onSubmit={fn()}
      selection={selection}
      columns={columns}
      onSelectionChange={handleSelectionChange}
    />
  )
}

export const WithDatabases: Story = {
  render: () => <RenderStory />,
}
