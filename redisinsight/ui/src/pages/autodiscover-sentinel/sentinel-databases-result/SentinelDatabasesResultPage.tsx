import React from 'react'
import SentinelDatabasesResult from './components/SentinelDatabasesResult/SentinelDatabasesResult'
import { useSentinelDatabasesResultConfig } from './useSentinelDatabasesResultConfig'

const SentinelDatabasesResultPage = () => {
  const {
    columns,
    items,
    countSuccessAdded,
    handleBackAdding,
    handleViewDatabases,
  } = useSentinelDatabasesResultConfig()
  return (
    <SentinelDatabasesResult
      columns={columns}
      masters={items}
      countSuccessAdded={countSuccessAdded}
      onBack={handleBackAdding}
      onViewDatabases={handleViewDatabases}
    />
  )
}

export default SentinelDatabasesResultPage
