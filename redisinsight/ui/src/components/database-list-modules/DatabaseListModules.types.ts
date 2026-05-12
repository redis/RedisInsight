import type { ReactNode } from 'react'
import type { AdditionalRedisModule } from 'apiClient'

export interface DatabaseListModulesProps {
  content?: ReactNode
  modules: AdditionalRedisModule[]
  inCircle?: boolean
  highlight?: boolean
  maxViewModules?: number
  tooltipTitle?: ReactNode
  withoutStyles?: boolean
}
