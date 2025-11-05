import { CellContext } from 'uiSrc/components/base/layout/table'
import { Instance } from 'uiSrc/slices/interfaces'

export type IDatabaseListCell = (
  props: CellContext<Instance, unknown>,
) => JSX.Element | null | string
