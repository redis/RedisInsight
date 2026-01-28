import type { IDatabaseModule } from 'uiSrc/utils/modules'

export interface DatabaseModulesListProps {
  modules: IDatabaseModule[]
  contentItems: IDatabaseModule[]
  inCircle?: boolean
  anchorClassName?: string
}
