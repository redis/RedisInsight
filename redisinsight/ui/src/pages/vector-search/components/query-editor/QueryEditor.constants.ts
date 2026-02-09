import { merge } from 'lodash'
import { defaultMonacoOptions } from 'uiSrc/constants'

export const editorOptions = merge({}, defaultMonacoOptions, {
  suggest: {
    showWords: false,
    showIcons: true,
    insertMode: 'replace',
    filterGraceful: false,
    matchOnWordStartOnly: true,
  },
  placeholder: 'Enter your RQE query...',
})

export const RQE_QUERY_TEMPLATES = [
  {
    label: 'FT.SEARCH',
    detail: 'Full-text search',
    documentation: 'FT.SEARCH {index} {query} [LIMIT offset num]',
    insertText: 'FT.SEARCH ${1:index} "${2:*}" LIMIT 0 10',
  },
  {
    label: 'FT.AGGREGATE',
    detail: 'Run aggregation query',
    documentation:
      'FT.AGGREGATE {index} {query} [GROUPBY nargs property ...]',
    insertText: 'FT.AGGREGATE ${1:index} "${2:*}"',
  },
  {
    label: 'FT.SEARCH (KNN)',
    detail: 'K-Nearest Neighbors vector search',
    documentation:
      'FT.SEARCH {index} "*=>[KNN num_neighbours @field $blob]" PARAMS 2 blob <binary> DIALECT 2',
    insertText:
      'FT.SEARCH ${1:index} "*=>[KNN ${2:10} @${3:vector_field} \\$blob]" PARAMS 2 blob "${4:binary_data}" DIALECT 2',
  },
  {
    label: 'FT.SEARCH (hybrid)',
    detail: 'Hybrid: filter + KNN',
    documentation:
      'FT.SEARCH {index} "(@field:{value})=>[KNN num @vec_field $blob]" PARAMS 2 blob <binary> DIALECT 2',
    insertText:
      'FT.SEARCH ${1:index} "(@${2:field}:{${3:value}})=>[KNN ${4:10} @${5:vector_field} \\$blob]" PARAMS 2 blob "${6:binary_data}" DIALECT 2',
  },
]
