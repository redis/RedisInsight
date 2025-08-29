import React from 'react'

import SentinelDatabases from './components'
import { useSentinelDatabasesConfig } from './useSentinelDatabasesConfig'

const SentinelDatabasesPage = () => {
  const {
    columns,
    selection,
    items,
    handleClose,
    handleBackAdditing,
    handleAddInstances,
  } = useSentinelDatabasesConfig()
  return (
    <SentinelDatabases
      columns={columns}
      selection={selection}
      masters={items}
      onClose={handleClose}
      onBack={handleBackAdditing}
      onSubmit={handleAddInstances}
    />
  )
}

export default SentinelDatabasesPage
