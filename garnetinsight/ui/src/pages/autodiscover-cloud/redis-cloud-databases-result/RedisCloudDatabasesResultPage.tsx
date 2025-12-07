import React from 'react'
import RedisCloudDatabasesResult from './RedisCloudDatabasesResult'
import { useCloudDatabasesResultConfig } from './hooks/useCloudDatabasesResultConfig'

const RedisCloudDatabasesResultPage = () => {
  const { instances, columns, handleClose, handleBackAdding } =
    useCloudDatabasesResultConfig()

  return (
    <RedisCloudDatabasesResult
      instances={instances}
      columns={columns}
      onView={handleClose}
      onBack={handleBackAdding}
    />
  )
}

export default RedisCloudDatabasesResultPage
