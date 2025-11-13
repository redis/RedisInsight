import type { ReactElement } from 'react'

import type { CellContext } from 'uiSrc/components/base/layout/table'
import type { RdiInstance } from 'uiSrc/slices/interfaces'

export type IRdiListCell = (
  props: CellContext<RdiInstance, unknown> & {
    field?: keyof RdiInstance
    withCopyIcon?: boolean
  },
) => ReactElement<any, any> | null
