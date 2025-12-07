import { merge } from 'lodash'
import { defaultMonacoOptions, TutorialsIds } from 'uiSrc/constants'

export const argInQuotesRegExp = /^['"](.|[\r\n])*['"]$/
export const aroundQuotesRegExp = /(^["']|["']$)/g

export const SYNTAX_CONTEXT_ID = 'syntaxWidgetContext'
export const SYNTAX_WIDGET_ID = 'syntax.content.widget'

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
