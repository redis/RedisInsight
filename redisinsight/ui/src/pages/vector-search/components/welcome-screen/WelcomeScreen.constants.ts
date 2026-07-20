import i18n from 'uiSrc/i18n'

import type { Feature } from './WelcomeScreen.types'

// Built at call time (not module scope) so titles/descriptions resolve in the
// active language when the welcome screen renders.
export const getFeatures = (): Feature[] => [
  {
    icon: 'VectorSearchIcon',
    title: i18n.t('vectorSearch.welcome.feature.fullText.title'),
    description: i18n.t('vectorSearch.welcome.feature.fullText.description'),
  },
  {
    icon: 'WorkbenchIcon',
    title: i18n.t('vectorSearch.welcome.feature.vector.title'),
    description: i18n.t('vectorSearch.welcome.feature.vector.description'),
  },
  {
    icon: 'MindmapIcon',
    title: i18n.t('vectorSearch.welcome.feature.hybrid.title'),
    description: i18n.t('vectorSearch.welcome.feature.hybrid.description'),
  },
  {
    icon: 'RocketIcon',
    title: i18n.t('vectorSearch.welcome.feature.performance.title'),
    description: i18n.t('vectorSearch.welcome.feature.performance.description'),
  },
]
