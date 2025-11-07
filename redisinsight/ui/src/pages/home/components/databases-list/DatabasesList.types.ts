import { ReactElement } from 'react'

import { CellContext } from 'uiSrc/components/base/layout/table'
import { Instance } from 'uiSrc/slices/interfaces'

export type IDatabaseListCell = (
  props: CellContext<Instance, unknown>,
) => ReactElement<any, any> | null
