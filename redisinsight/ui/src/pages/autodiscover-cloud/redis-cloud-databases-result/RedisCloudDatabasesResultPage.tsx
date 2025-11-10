import React from 'react'
import RedisCloudDatabasesResult from './RedisCloudDatabasesResult'
import { useCloudDatabasesResultConfig } from 'uiSrc/pages/autodiscover-cloud/redis-cloud-databases-result/useCloudDatabasesResultConfig'

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
