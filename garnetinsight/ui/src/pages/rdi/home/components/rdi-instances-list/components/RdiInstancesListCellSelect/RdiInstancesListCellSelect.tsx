import React from 'react'

import { Table } from 'uiSrc/components/base/layout/table'
import { IRdiListCell } from '../../RdiInstancesList.types'

const RdiInstancesListCellSelect: IRdiListCell = (props) => (
  <Table.RowSelectionButton
    {...props}
    onClick={(e: any) => e.stopPropagation()}
  />
)

export default RdiInstancesListCellSelect
