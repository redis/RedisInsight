import React from 'react'

import { DatabaseListModules } from 'uiSrc/components'

import { IDatabaseListCell } from '../../DatabasesList.types'

const DatabasesListCellModules: IDatabaseListCell = ({ row }) => {
  const instance = row.original
  const { modules = [] } = instance

  return <DatabaseListModules maxViewModules={5} modules={modules} />
}

export default DatabasesListCellModules
