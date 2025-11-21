import React from 'react'

import { DatabaseListOptions } from 'uiSrc/components'
import { parseInstanceOptionsCloud } from 'uiSrc/utils'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import { getMetaProps } from 'uiSrc/utils/column'

interface OptionsCellProps {
  instances: InstanceRedisCloud[]
}

export const OptionsCell = ({
  row,
  column,
}: CellContext<InstanceRedisCloud, unknown>) => {
  const { databaseId } = row.original
  const { instances } = getMetaProps<OptionsCellProps>(column)
  const options = parseInstanceOptionsCloud(databaseId, instances || [])
  return <DatabaseListOptions options={options} />
}

