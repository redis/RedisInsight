import React from 'react'

import { useSentinelDatabasesConfig } from './useSentinelDatabasesConfig'
import SentinelDatabases from './components/SentinelDatabases/SentinelDatabases'

const SentinelDatabasesPage = () => {
  const {
    columns,
    selection,
    items,
    handleClose,
    handleBackAdding,
    handleAddInstances,
    handleSelectionChange,
  } = useSentinelDatabasesConfig()

  return (
    <SentinelDatabases
      columns={columns}
      selection={selection}
      masters={items}
      onClose={handleClose}
      onBack={handleBackAdding}
      onSubmit={handleAddInstances}
      onSelectionChange={handleSelectionChange}
    />
  )
}

export default SentinelDatabasesPage
