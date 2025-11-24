import React from 'react'
import { DatabaseListModules } from 'uiSrc/components'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCluster } from 'uiSrc/slices/interfaces'

export const CapabilitiesCell = ({
  row,
}: CellContext<InstanceRedisCluster, unknown>) => {
  const { modules } = row.original
  return (
    <DatabaseListModules
      modules={modules?.map((name) => ({ name }))}
    />
  )
}

