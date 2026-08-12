import {
  constructKeysToTreeMockResult,
  delimiterMock,
} from './constructKeysToTreeMockResult'
import {
  constructKeysToTree,
  splitWithPrefixThreshold,
} from '../constructKeysToTree'
import { KeyTypes } from 'uiSrc/constants'
import { IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'

const constructKeysToTreeTests: any[] = [
  [
    {
      items: [
        { nameString: 'keys:1:2', type: 'hash', ttl: -1, size: 71 },
        { nameString: 'keys:1:1', type: 'hash', ttl: -1, size: 71 },
        { nameString: 'empty::test', type: 'hash', ttl: -1, size: 71 },
        { nameString: 'test1', type: 'hash', ttl: -1, size: 71 },
        { nameString: 'test2', type: 'hash', ttl: -1, size: 71 },
        { nameString: 'keys:1', type: 'hash', ttl: -1, size: 71 },
        { nameString: 'keys1', type: 'hash', ttl: -1, size: 71 },
        { nameString: 'keys:3', type: 'hash', ttl: -1, size: 71 },
        { nameString: 'keys:2', type: 'hash', ttl: -1, size: 71 },
        { nameString: 'keys_2', type: 'hash', ttl: -1, size: 71 },
      ],
      delimiterPattern: delimiterMock,
    },
    constructKeysToTreeMockResult,
  ],
]

const removeIds = (nodes: any[]) =>
  nodes.map(({ children, id: _id, ...rest }) => ({
    ...rest,
    children: removeIds(children),
  }))

describe('constructKeysToTree', () => {
  it.each(constructKeysToTreeTests)(
    'for input: %s (items), should be output: %s',
    (items, expected) => {
      const result = constructKeysToTree(items)
      expect(removeIds(result)).toEqual(expected)
    },
  )
})

describe('splitWithPrefixThreshold', () => {
  it('prefixLength=0 falls through to plain split', () => {
    expect(splitWithPrefixThreshold('ab:cd:ef', ':', 0)).toEqual([
      'ab',
      'cd',
      'ef',
    ])
  })

  it('prefixLength shorter than first delimiter merges prefix into first token', () => {
    // prefix covers 'ab:' (3 chars), rest is 'cd:ef'
    expect(splitWithPrefixThreshold('ab:cd:ef', ':', 3)).toEqual([
      'ab:cd',
      'ef',
    ])
  })

  it('prefixLength exactly equals name length — key treated as single segment', () => {
    expect(splitWithPrefixThreshold('ab:cd', ':', 5)).toEqual(['ab:cd'])
  })

  it('prefixLength longer than name length falls through to plain split', () => {
    expect(splitWithPrefixThreshold('ab:cd', ':', 10)).toEqual(['ab', 'cd'])
  })

  it('prefixLength covers no delimiters — behaves like plain split', () => {
    expect(splitWithPrefixThreshold('ab:cd:ef', ':', 2)).toEqual([
      'ab',
      'cd',
      'ef',
    ])
  })

  it('key with no delimiters always returns single segment', () => {
    expect(splitWithPrefixThreshold('abcdef', ':', 3)).toEqual(['abcdef'])
  })

  it('empty string returns array with empty string', () => {
    expect(splitWithPrefixThreshold('', ':', 5)).toEqual([''])
  })
})

describe('constructKeysToTree with prefixLength', () => {
  it('merges prefix into first folder name so first-level delimiter is ignored', () => {
    const result = constructKeysToTree({
      items: [
        {
          nameString: 'tenant:app:resource',
          type: KeyTypes.Hash,
          ttl: -1,
          size: 0,
        },
      ] as unknown as IKeyPropTypes[],
      delimiterPattern: ':',
      delimiters: [':'],
      prefixLength: 7, // covers 'tenant:'
    })
    const folders = removeIds(result)
    // First-level node should be 'tenant:app', not 'tenant'
    expect(folders[0].nameString).toBe('tenant:app')
    expect(folders[0].children[0].isLeaf).toBe(true)
  })

  it('prefixLength=0 produces original tree structure', () => {
    const withPrefix = constructKeysToTree({
      items: [
        { nameString: 'ab:cd:ef', type: KeyTypes.Hash, ttl: -1, size: 0 },
      ] as unknown as IKeyPropTypes[],
      delimiterPattern: ':',
      delimiters: [':'],
      prefixLength: 0,
    })
    const withoutPrefix = constructKeysToTree({
      items: [
        { nameString: 'ab:cd:ef', type: KeyTypes.Hash, ttl: -1, size: 0 },
      ] as unknown as IKeyPropTypes[],
      delimiterPattern: ':',
      delimiters: [':'],
    })
    expect(removeIds(withPrefix)).toEqual(removeIds(withoutPrefix))
  })

  it('prefixLength >= name length produces a single leaf at root', () => {
    const result = constructKeysToTree({
      items: [
        { nameString: 'ab:cd', type: KeyTypes.Hash, ttl: -1, size: 0 },
      ] as unknown as IKeyPropTypes[],
      delimiterPattern: ':',
      delimiters: [':'],
      prefixLength: 10,
    })
    const nodes = removeIds(result)
    expect(nodes).toHaveLength(1)
    expect(nodes[0].isLeaf).toBe(true)
    expect(nodes[0].nameString).toBe('ab:cd')
  })
})
