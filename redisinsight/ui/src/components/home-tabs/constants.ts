import { FeatureFlags, Pages } from 'uiSrc/constants'
import { TabInfo } from 'uiSrc/components/base/layout/tabs'

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
  {
    value: 'agent-memory',
    label: 'Agent Memory',
    content: null,
    path: Pages.agentMemory,
    featureFlag: FeatureFlags.agentMemory,
  },
]

export { tabs }
