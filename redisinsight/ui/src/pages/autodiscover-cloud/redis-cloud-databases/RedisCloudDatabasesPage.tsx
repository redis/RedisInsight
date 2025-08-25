import React from 'react'
import RedisCloudDatabases from './RedisCloudDatabases'
import { useCloudDatabasesConfig } from 'uiSrc/pages/autodiscover-cloud/redis-cloud-databases/useCloudDatabasesConfig'

const RedisCloudDatabasesPage = () => {
  const {
    columns,
    selection,
    handleClose,
    handleBackAdding,
    handleAddInstances,
  } = useCloudDatabasesConfig()

  return (
    <RedisCloudDatabases
      selection={selection}
      onClose={handleClose}
      onBack={handleBackAdding}
      onSubmit={handleAddInstances}
      columns={columns}
    />
  )
}

export default RedisCloudDatabasesPage
