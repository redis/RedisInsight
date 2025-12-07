import { MOCK_RECOMMENDATIONS } from 'uiSrc/constants/mocks/mock-recommendations'
import { sortRecommendations, replaceVariables } from '../../recommendation'

const sortRecommendationsTests = [
  {
    input: [],
    expected: [],
  },
  {
    input: [
      { name: 'luaScript' },
      { name: 'bigSets' },
      { name: 'searchIndexes' },
    ],
    expected: [
      { name: 'searchIndexes' },
      { name: 'bigSets' },
      { name: 'luaScript' },
    ],
  },
  {
    input: [{ name: 'luaScript' }, { name: 'bigSets' }, { name: 'searchJSON' }],
    expected: [
      { name: 'searchJSON' },
      { name: 'bigSets' },
      { name: 'luaScript' },
    ],
  },
  {
    input: [
      { name: 'luaScript' },
      { name: 'bigSets' },
      { name: 'searchIndexes' },
      { name: 'searchJSON' },
      { name: 'useSmallerKeys' },
      { name: 'RTS' },
    ],
    expected: [
      { name: 'searchJSON' },
      { name: 'searchIndexes' },
      { name: 'RTS' },
      { name: 'bigSets' },
      { name: 'luaScript' },
      { name: 'useSmallerKeys' },
    ],
  },
]

const replaceVariablesTests = [
  { input: ['value'], expected: 'value' },
  // eslint-disable-next-line no-template-curly-in-string
  {
    input: ['some ${0} text ${1}', ['foo', 'bar'], { foo: '7', bar: 'bar' }],
    expected: 'some 7 text bar',
  },
  { input: ['value'], expected: 'value' },
  { input: ['value'], expected: 'value' },
]

describe('sortRecommendations', () => {
  test.each(sortRecommendationsTests)('%j', ({ input, expected }) => {
    const result = sortRecommendations(input, MOCK_RECOMMENDATIONS)
    expect(result).toEqual(expected)
  })
})

describe('replaceVariables', () => {
  test.each(replaceVariablesTests)('%j', ({ input, expected }) => {
    // @ts-ignore
    const result = replaceVariables(...input)
    expect(result).toEqual(expected)
  })
})
