import React from 'react'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import RedisCloudDatabases from './RedisCloudDatabases'
import { useCloudDatabasesConfig } from './hooks/useCloudDatabasesConfig'

const EMPTY_INSTANCES: InstanceRedisCloud[] = []

const RedisCloudDatabasesPage = () => {
  const {
    columns,
    selection,
    handleClose,
    handleBackAdding,
    handleAddInstances,
    handleSelectionChange,
    instances,
  } = useCloudDatabasesConfig()

  return (
    <RedisCloudDatabases
      selection={selection}
      onClose={handleClose}
      onBack={handleBackAdding}
      onSubmit={handleAddInstances}
      columns={columns}
      instances={instances || EMPTY_INSTANCES}
      loading={false}
      onSelectionChange={handleSelectionChange}
    />
  )
}

export default RedisCloudDatabasesPage
