import { TabInfo } from 'uiBase/layout'
import { FeatureFlags, Pages } from 'uiSrc/constants'

type HomeTab = TabInfo & {
  path: string
  featureFlag?: FeatureFlags
}

const tabs: HomeTab[] = [
  {
    value: 'databases',
    label: 'Redis Databases',
    content: null,
    path: Pages.home,
  },
  {
    value: 'rdi-instances',
    label: 'Redis Data Integration',
    content: null,
    path: Pages.rdi,
    featureFlag: FeatureFlags.rdi,
  },
]

export { tabs }
