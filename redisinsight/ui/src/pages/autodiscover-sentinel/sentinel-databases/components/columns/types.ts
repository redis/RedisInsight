import type { ReactElement } from 'react'

import type { CellContext } from 'uiSrc/components/base/layout/table'
import type { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'

export type SentinelMasterListCellTypeProps = CellContext<
  ModifiedSentinelMaster,
  unknown
>
export type SentinelMasterListCellType = (
  props: SentinelMasterListCellTypeProps,
) => ReactElement<any, any> | null
