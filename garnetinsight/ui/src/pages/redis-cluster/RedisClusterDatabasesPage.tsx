import React from 'react'
import RedisClusterDatabases from './RedisClusterDatabases'
import RedisClusterDatabasesResult from './RedisClusterDatabasesResult'
import { useClusterDatabasesConfig } from './useClusterDatabasesConfig'

const RedisClusterDatabasesPage = () => {
  const {
    columns,
    columnsResult,
    instancesAdded,
    instances,
    loading,
    handleClose,
    handleBackAdding,
    handleAddInstances,
  } = useClusterDatabasesConfig()

  if (instancesAdded.length) {
    return (
      <RedisClusterDatabasesResult
        instances={instancesAdded || []}
        onView={handleClose}
        onBack={handleBackAdding}
        columns={columnsResult}
      />
    )
  }

  return (
    <RedisClusterDatabases
      instances={instances || []}
      loading={loading}
      onClose={handleClose}
      onBack={handleBackAdding}
      onSubmit={handleAddInstances}
      columns={columns}
    />
  )
}

export default RedisClusterDatabasesPage
