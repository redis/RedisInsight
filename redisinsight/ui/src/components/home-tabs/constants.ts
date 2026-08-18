import { TFunction } from 'i18next'
import { FeatureFlags, Pages } from 'uiSrc/constants'
import { TabInfo } from 'uiSrc/components/base/layout/tabs'

type HomeTab = TabInfo & {
  path: string
  featureFlag?: FeatureFlags
}

export const getTabs = (t: TFunction): HomeTab[] => [
  {
    value: 'databases',
    label: t('homeTabs.redisDatabases'),
    content: null,
    path: Pages.home,
  },
  {
    value: 'rdi-instances',
    label: t('homeTabs.rdiInstances'),
    content: null,
    path: Pages.rdi,
    featureFlag: FeatureFlags.rdi,
  },
]
