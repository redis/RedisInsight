import { capitalize } from 'lodash'

import { CONNECTION_TYPE_DISPLAY } from 'uiSrc/slices/interfaces'

import { IDatabaseListCell } from '../../DatabasesList.types'

const DatabasesListCellConnectionType: IDatabaseListCell = ({ row }) => {
  const instance = row.original
  const { connectionType } = instance

  return CONNECTION_TYPE_DISPLAY[connectionType!] || capitalize(connectionType)
}

export default DatabasesListCellConnectionType
