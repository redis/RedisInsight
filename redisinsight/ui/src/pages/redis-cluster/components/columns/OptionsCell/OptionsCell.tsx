import React from 'react'
import { useSelector } from 'react-redux'

import { DatabaseListOptions } from 'uiSrc/components'
import { parseInstanceOptionsCluster } from 'uiSrc/utils'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCluster } from 'uiSrc/slices/interfaces'
import { clusterSelector } from 'uiSrc/slices/instances/cluster'

export const OptionsCell = ({ row }: CellContext<InstanceRedisCluster, unknown>) => {
  const { data: instances } = useSelector(clusterSelector)
  const { uid } = row.original
  const options = parseInstanceOptionsCluster(uid, instances || [])
  return <DatabaseListOptions options={options} />
}

