import React from 'react'
import { useSelector } from 'react-redux'

import { DatabaseListOptions } from 'uiSrc/components'
import { parseInstanceOptionsCloud } from 'uiSrc/utils'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import { cloudSelector } from 'uiSrc/slices/instances/cloud'

export const OptionsCell = ({ row }: CellContext<InstanceRedisCloud, unknown>) => {
  const { data: instancesForOptions } = useSelector(cloudSelector)
  const { databaseId } = row.original
  const options = parseInstanceOptionsCloud(
    databaseId,
    instancesForOptions || [],
  )
  return <DatabaseListOptions options={options} />
}

