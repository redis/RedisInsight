import { lastConnectionFormat } from 'uiSrc/utils'

import { IDatabaseListCell } from '../../DatabasesList.types'

const DatabasesListCellLastConnection: IDatabaseListCell = ({ row }) => {
  const instance = row.original
  const { lastConnection } = instance

  return lastConnectionFormat(lastConnection)
}

export default DatabasesListCellLastConnection
