import { merge } from 'lodash'
import { defaultMonacoOptions, TutorialsIds } from 'uiSrc/constants'
import i18n from 'uiSrc/i18n'

export const aroundQuotesRegExp = /(^["']|["']$)/g

export const options = merge({}, defaultMonacoOptions, {
  suggest: {
    showWords: false,
    showIcons: true,
    insertMode: 'replace',
    filterGraceful: false,
    matchOnWordStartOnly: true,
  },
})

export const TUTORIALS = [
  {
    id: TutorialsIds.IntroToSearch,
    title: i18n.t('workbench.tutorials.introToSearch'),
  },
  {
    id: TutorialsIds.BasicRedisUseCases,
    title: i18n.t('workbench.tutorials.basicUseCases'),
  },
  {
    id: TutorialsIds.IntroVectorSearch,
    title: i18n.t('workbench.tutorials.introToVectorSearch'),
  },
]
