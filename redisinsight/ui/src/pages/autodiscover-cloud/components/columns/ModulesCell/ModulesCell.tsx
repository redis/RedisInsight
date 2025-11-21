import React from 'react'

import { DatabaseListModules } from 'uiSrc/components'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'

export const ModulesCell = ({
  row,
}: CellContext<InstanceRedisCloud, unknown>) => {
  const { modules } = row.original
  return (
    <DatabaseListModules modules={modules.map((name) => ({ name }))} />
  )
}

