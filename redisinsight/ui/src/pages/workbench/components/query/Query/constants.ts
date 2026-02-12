import { merge } from 'lodash'
import { defaultMonacoOptions, TutorialsIds } from 'uiSrc/constants'

export const aroundQuotesRegExp = /(^["']|["']$)/g

export const options = merge(defaultMonacoOptions, {
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
    title: 'Intro to search',
  },
  {
    id: TutorialsIds.BasicRedisUseCases,
    title: 'Basic use cases',
  },
  {
    id: TutorialsIds.IntroVectorSearch,
    title: 'Intro to vector search',
  },
]
