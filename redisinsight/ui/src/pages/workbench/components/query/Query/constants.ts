import { merge } from 'lodash'
import { defaultMonacoOptions, TutorialsIds } from 'uiSrc/constants'

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
    titleKey: 'workbench.tutorials.introToSearch',
  },
  {
    id: TutorialsIds.BasicRedisUseCases,
    titleKey: 'workbench.tutorials.basicUseCases',
  },
  {
    id: TutorialsIds.IntroVectorSearch,
    titleKey: 'workbench.tutorials.introToVectorSearch',
  },
] as const
