import { ProfileQueryType } from '../../constants'

import {
  generateGraphProfileQuery,
  generateSearchProfileQuery,
  generateProfileQueryForCommand,
} from '../profile'

const generateGraphProfileQueryTests: Record<string, any>[] = [
  {
    input: 'GRAPH.QUERY key "MATCH (n) RETURN n"',
    output: 'graph.profile key "MATCH (n) RETURN n"',
    type: ProfileQueryType.Profile,
  },
  {
    input: 'GRAPH.QUERY key "MATCH (n) RETURN n"',
    output: 'graph.explain key "MATCH (n) RETURN n"',
    type: ProfileQueryType.Explain,
  },
  {
    input: 'graph.query key "MATCH (n) RETURN n"',
    output: 'graph.profile key "MATCH (n) RETURN n"',
    type: ProfileQueryType.Profile,
  },
  {
    input: 'graph.query key "MATCH (n) RETURN n"',
    output: 'graph.explain key "MATCH (n) RETURN n"',
    type: ProfileQueryType.Explain,
  },
  { input: null, output: null, type: ProfileQueryType.Profile },
  { input: null, output: null, type: ProfileQueryType.Explain },
]

describe('generateGraphProfileQuery', () => {
  generateGraphProfileQueryTests.forEach((test) => {
    it(`should be output: ${test.output} for input: ${test.input} and type: ${test.type}`, () => {
      const result = generateGraphProfileQuery(test.input, test.type)
      expect(result).toEqual(test.output)
    })
  })
})

const generateSearchProfileQueryTests: Record<string, any>[] = [
  {
    input: 'FT.SEARCH index tomatoes',
    output: 'ft.profile index SEARCH QUERY tomatoes',
    type: ProfileQueryType.Profile,
  },
  {
    input: 'FT.AGGREGATE index tomatoes',
    output: 'ft.profile index AGGREGATE QUERY tomatoes',
    type: ProfileQueryType.Profile,
  },
  {
    input: 'FT.SEARCH index tomatoes',
    output: 'ft.explain index tomatoes',
    type: ProfileQueryType.Explain,
  },
  {
    input: 'FT.AGGREGATE index tomatoes',
    output: 'ft.explain index tomatoes',
    type: ProfileQueryType.Explain,
  },
  {
    input: 'ft.search index tomatoes',
    output: 'ft.profile index search QUERY tomatoes',
    type: ProfileQueryType.Profile,
  },
  {
    input: 'ft.aggregate index tomatoes',
    output: 'ft.profile index aggregate QUERY tomatoes',
    type: ProfileQueryType.Profile,
  },
  {
    input: 'ft.search index tomatoes',
    output: 'ft.explain index tomatoes',
    type: ProfileQueryType.Explain,
  },
  {
    input: 'ft.aggregate index tomatoes',
    output: 'ft.explain index tomatoes',
    type: ProfileQueryType.Explain,
  },
  {
    input: 'ft.SEARCH index tomatoes',
    output: 'ft.profile index SEARCH QUERY tomatoes',
    type: ProfileQueryType.Profile,
  },
  {
    input: 'ft.AGGREGATE index tomatoes',
    output: 'ft.profile index AGGREGATE QUERY tomatoes',
    type: ProfileQueryType.Profile,
  },
  {
    input: 'ft.SEARCH index tomatoes',
    output: 'ft.explain index tomatoes',
    type: ProfileQueryType.Explain,
  },
  {
    input: 'ft.AGGREGATE index tomatoes',
    output: 'ft.explain index tomatoes',
    type: ProfileQueryType.Explain,
  },
  { input: null, output: null, type: ProfileQueryType.Profile },
  { input: null, output: null, type: ProfileQueryType.Explain },
]

describe('generateSearchProfileQuery', () => {
  generateSearchProfileQueryTests.forEach((test) => {
    it(`should be output: ${test.output} for input: ${test.input} and type: ${test.type}`, () => {
      const result = generateSearchProfileQuery(test.input, test.type)
      expect(result).toEqual(test.output)
    })
  })
})

const generateProfileQueryForCommandTests: Record<string, any>[] = [
  ...generateGraphProfileQueryTests,
  ...generateSearchProfileQueryTests,
  { input: 'GRAPH.LIST', output: null, type: ProfileQueryType.Profile },
  { input: 'GRAPH.LIST', output: null, type: ProfileQueryType.Explain },
  {
    input: 'GRAPH.PROFILE key "MATCH (n) RETURN n"',
    output: null,
    type: ProfileQueryType.Profile,
  },
  {
    input: 'GRAPH.PROFILE key "MATCH (n) RETURN n"',
    output: null,
    type: ProfileQueryType.Explain,
  },
  {
    input: 'GRAPH.EXPLAIN key "MATCH (n) RETURN n"',
    output: null,
    type: ProfileQueryType.Profile,
  },
  {
    input: 'GRAPH.EXPLAIN key "MATCH (n) RETURN n"',
    output: null,
    type: ProfileQueryType.Explain,
  },
  { input: 'ft._LIST', output: null, type: ProfileQueryType.Profile },
  { input: 'ft._LIST', output: null, type: ProfileQueryType.Explain },
  {
    input: 'ft.profile index SEARCH QUERY tomatoes',
    output: null,
    type: ProfileQueryType.Profile,
  },
  {
    input: 'ft.profile index AGGREGATE QUERY tomatoes',
    output: null,
    type: ProfileQueryType.Explain,
  },
  {
    input: 'ft.explain index tomatoes',
    output: null,
    type: ProfileQueryType.Profile,
  },
  {
    input: 'ft.explain index tomatoes',
    output: null,
    type: ProfileQueryType.Explain,
  },
]
describe('generateProfileQueryForCommand', () => {
  generateProfileQueryForCommandTests.forEach((test) => {
    it(`should be output: ${test.output} for input: ${test.input} and type: ${test.type}`, () => {
      const result = generateProfileQueryForCommand(test.input, test.type)

      expect(result).toEqual(test.output)
    })
  })
})
