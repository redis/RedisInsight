import type { ReactNode } from 'react'
import type { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'

export interface DatabaseListModulesProps {
  content?: ReactNode
  modules: AdditionalRedisModule[]
  inCircle?: boolean
  highlight?: boolean
  maxViewModules?: number
  tooltipTitle?: ReactNode
  withoutStyles?: boolean
}
