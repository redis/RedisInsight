import React from 'react'
import RedisCloudDatabases from './RedisCloudDatabases'
import { useCloudDatabasesConfig } from './useCloudDatabasesConfig'

const RedisCloudDatabasesPage = () => {
  const {
    columns,
    selection,
    handleClose,
    handleBackAdding,
    handleAddInstances,
    handleSelectionChange,
  } = useCloudDatabasesConfig()

  return (
    <RedisCloudDatabases
      selection={selection}
      onClose={handleClose}
      onBack={handleBackAdding}
      onSubmit={handleAddInstances}
      columns={columns}
      instances={[]}
      loading={false}
      onSelectionChange={handleSelectionChange}
    />
  )
}

export default RedisCloudDatabasesPage
