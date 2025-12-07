import {
  ExecuteQueryParams,
  ResultsMode,
  RunQueryMode,
} from 'uiSrc/slices/interfaces'
import {
  getExecuteParams,
  getParsedParamsInQuery,
  parseParams,
  findMarkdownPath,
} from 'uiSrc/utils'
import { CodeButtonParams, MOCK_TUTORIALS_ITEMS } from 'uiSrc/constants'

const paramsState: ExecuteQueryParams = {
  activeRunQueryMode: RunQueryMode.ASCII,
  resultsMode: ResultsMode.GroupMode,
  batchSize: 10,
}

describe('getExecuteParams', () => {
  it('should properly return params', () => {
    const btnParams1: CodeButtonParams = { pipeline: '5', mode: 'raw' }
    const btnParams2: CodeButtonParams = { pipeline: '1.5', mode: 'ascii' }
    const btnParams3: CodeButtonParams = { pipeline: 'abc' }
    const btnParams4: CodeButtonParams = { results: 'single', mode: 'raw' }
    const btnParams5: CodeButtonParams = {
      results: 'single',
      mode: 'raw',
      pipeline: '4',
    }
    const btnParams6: CodeButtonParams = {
      results: 'single',
      mode: 'raw',
      pipeline: '-4',
    }

    const expect1 = {
      activeRunQueryMode: RunQueryMode.Raw,
      resultsMode: ResultsMode.GroupMode,
      batchSize: 5,
    }
    const expect2 = {
      activeRunQueryMode: RunQueryMode.ASCII,
      resultsMode: ResultsMode.GroupMode,
      batchSize: 10,
    }
    const expect3 = {
      activeRunQueryMode: RunQueryMode.ASCII,
      resultsMode: ResultsMode.GroupMode,
      batchSize: 10,
    }
    const expect4 = {
      activeRunQueryMode: RunQueryMode.Raw,
      resultsMode: ResultsMode.Default,
      batchSize: 10,
    }
    const expect5 = {
      activeRunQueryMode: RunQueryMode.Raw,
      resultsMode: ResultsMode.Default,
      batchSize: 4,
    }
    const expect6 = {
      activeRunQueryMode: RunQueryMode.Raw,
      resultsMode: ResultsMode.Default,
      batchSize: 10,
    }

    expect(getExecuteParams(btnParams1, paramsState)).toEqual(expect1)
    expect(getExecuteParams(btnParams2, paramsState)).toEqual(expect2)
    expect(getExecuteParams(btnParams3, paramsState)).toEqual(expect3)
    expect(getExecuteParams(btnParams4, paramsState)).toEqual(expect4)
    expect(getExecuteParams(btnParams5, paramsState)).toEqual(expect5)
    expect(getExecuteParams(btnParams6, paramsState)).toEqual(expect6)
  })
})

describe('getParsedParamsInQuery', () => {
  it.each([
    ['123', {}],
    ['get test\nget test2', {}],
    ['get test\nget test2\nget test3', {}],
    ['[]\nget test\nget test2\nget test3', undefined],
    ['get test\n[mode=raw]\nget test2\nget test3', {}],
    ['[mode=raw]\nget test\nget test2\nget test3', { mode: 'raw' }],
    ['[mode=raw;mode=ascii]\nget test\nget test2\nget test3', { mode: 'raw' }],
    [
      '[mode=raw;results=ascii]info\nget test\nget test2\nget test3',
      { mode: 'raw', results: 'ascii' },
    ],
    [
      '[mode=raw;results=group;pipeline=10]\nget test\nget test2\nget test3',
      { mode: 'raw', results: 'group', pipeline: '10' },
    ],
  ])('for input: %s (input), should be output: %s', (input, expected) => {
    const result = getParsedParamsInQuery(input)
    expect(result).toEqual(expected)
  })
})

const findMarkdownPathTests = [
  // mdPath
  {
    input: { mdPath: '/static/workbench/quick-guides/document/learn-more.md' },
    expected: '0/0',
  },
  { input: { mdPath: 'quick-guides/working-with-hash.html' }, expected: '0/2' },
  { input: { mdPath: 'quick-guides/working-with-json.html' }, expected: '0/1' },
  {
    input: { mdPath: 'quick-guides/document-capabilities.html' },
    expected: '1',
  },
  { input: { mdPath: '/redis_stack/working_with_json.md' }, expected: '4' },

  // id
  { input: { id: 'document-capabilities' }, expected: '0/0' },
  { input: { id: 'working-with-hash' }, expected: '0/2' },
  { input: { id: 'working-with-json' }, expected: '0/1' },
  { input: { id: 'second-internal-page' }, expected: '2' },
  { input: { id: 'working_with_json' }, expected: '4' },
]

describe('findMarkdownPath', () => {
  test.each(findMarkdownPathTests)('%j', ({ input, expected }) => {
    // @ts-ignore
    const result = findMarkdownPath(MOCK_TUTORIALS_ITEMS, input)
    expect(result).toEqual(expected)
  })
})

const parseParamsTests: any[] = [
  ['[]', undefined],
  ['[execute=auto]', { execute: 'auto' }],
  ['[execute=auto;]', { execute: 'auto' }],
  ['[execute=auto;mode=group]', { execute: 'auto', mode: 'group' }],
  ['[execute=auto;mode=group;]', { execute: 'auto', mode: 'group' }],
  ['[execute=auto;  mode=group;   ]', { execute: 'auto', mode: 'group' }],
  ['[mode=raw;mode=ascii;mode=group;]', { mode: 'raw' }], // first parameters should be applied
  ['[mode=raw]\n', { mode: 'raw' }],
  ['[mode=raw]\r', { mode: 'raw' }],
]

describe('parseParams', () => {
  it.each(parseParamsTests)(
    'for input: %s (params), should be output: %s',
    (params, expected) => {
      const result = parseParams(params)
      expect(result).toEqual(expected)
    },
  )
})
