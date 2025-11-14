import React from 'react'
import RedisCloudDatabases from './RedisCloudDatabases'
import { useCloudDatabasesConfig } from './hooks/useCloudDatabasesConfig'

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
      instances={instances || []}
      loading={false}
      onSelectionChange={handleSelectionChange}
    />
  )
}

export default RedisCloudDatabasesPage
