import {
  constructKeysToTreeMockResult,
  delimiterMock,
} from './constructKeysToTreeMockResult'
import { constructKeysToTree } from '../constructKeysToTree'
import { splitWithPrefixThreshold } from '../splitWithPrefixThreshold'
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

  it('prefixLength covers no delimiters — tree structure matches prefixLength=0', () => {
    // prefixLength=2 on 'ab:cd:ef' leaves the first ':' outside the prefix,
    // so the result is identical to no-prefix splitting
    const withSmallPrefix = constructKeysToTree({
      items: [
        { nameString: 'ab:cd:ef', type: KeyTypes.Hash, ttl: -1, size: 0 },
      ] as unknown as IKeyPropTypes[],
      delimiterPattern: ':',
      delimiters: [':'],
      prefixLength: 2,
    })
    const withZero = constructKeysToTree({
      items: [
        { nameString: 'ab:cd:ef', type: KeyTypes.Hash, ttl: -1, size: 0 },
      ] as unknown as IKeyPropTypes[],
      delimiterPattern: ':',
      delimiters: [':'],
      prefixLength: 0,
    })
    expect(removeIds(withSmallPrefix)).toEqual(removeIds(withZero))
  })

  it('key with no delimiters produces a single leaf regardless of prefixLength', () => {
    const result = constructKeysToTree({
      items: [
        { nameString: 'abcdef', type: KeyTypes.Hash, ttl: -1, size: 0 },
      ] as unknown as IKeyPropTypes[],
      delimiterPattern: ':',
      delimiters: [':'],
      prefixLength: 3,
    })
    const nodes = removeIds(result)
    expect(nodes).toHaveLength(1)
    expect(nodes[0].isLeaf).toBe(true)
    expect(nodes[0].nameString).toBe('abcdef')
  })
})

// These exercise the copy of splitWithPrefixThreshold that is inlined into
// constructKeysToTree for the Web Worker, not the exported helper.
describe('constructKeysToTree with hash tags', () => {
  const buildTree = (names: string[], prefixLength = 0, delimiter = ':') =>
    removeIds(
      constructKeysToTree({
        items: names.map((nameString) => ({
          nameString,
          type: KeyTypes.Hash,
          ttl: -1,
          size: 0,
        })) as unknown as IKeyPropTypes[],
        delimiterPattern: delimiter,
        delimiters: [delimiter],
        prefixLength,
      }),
    )

  it('keeps keys with different hash tags in separate folders', () => {
    const nodes = buildTree([
      '{portal2:co}:something',
      '{portal2:tb}:something',
    ])

    expect(nodes.map((node: any) => node.nameString)).toEqual([
      '{portal2:co}',
      '{portal2:tb}',
    ])
    expect(nodes[0].children[0].isLeaf).toBe(true)
  })

  it('groups keys sharing a hash tag under one folder', () => {
    const nodes = buildTree(['{portal2:co}:something', '{portal2:co}:other'])

    expect(nodes).toHaveLength(1)
    expect(nodes[0].nameString).toBe('{portal2:co}')
    expect(nodes[0].keyCount).toBe(2)
    // leaf nameString is the full key name; VirtualTree derives the visible
    // label from it with splitWithPrefixThreshold(...).pop()
    expect(
      nodes[0].children.map((child: any) => child.nameString).sort(),
    ).toEqual(['{portal2:co}:other', '{portal2:co}:something'])
    expect(
      nodes[0].children
        .map((child: any) =>
          splitWithPrefixThreshold(child.nameString, ':', 0).pop(),
        )
        .sort(),
    ).toEqual(['other', 'something'])
  })

  it('leaves keys without a usable hash tag untouched', () => {
    expect(buildTree(['{user}:1:2'])[0].nameString).toBe('{user}')
    expect(buildTree(['foo{}:bar:baz'])[0].nameString).toBe('foo{}')
    expect(buildTree(['foo{bar:baz'])[0].nameString).toBe('foo{bar')
    expect(buildTree(['foo}bar{baz:qux'])[0].nameString).toBe('foo}bar{baz')
    expect(buildTree(['user:1:name'])[0].nameString).toBe('user')
  })

  it('treats only the first brace pair as a hash tag', () => {
    const nodes = buildTree(['a{b:c}:d:{e:f}'])

    expect(nodes[0].nameString).toBe('a{b:c}')
    expect(nodes[0].children[0].nameString).toBe('d')
    expect(nodes[0].children[0].children[0].nameString).toBe('{e')
  })

  it('ignores every configured delimiter inside a hash tag', () => {
    const nodes = removeIds(
      constructKeysToTree({
        items: [
          { nameString: '{a:b_c}:d_e', type: KeyTypes.Hash, ttl: -1, size: 0 },
        ] as unknown as IKeyPropTypes[],
        delimiterPattern: ':|_',
        delimiters: [':', '_'],
      }),
    )

    expect(nodes[0].nameString).toBe('{a:b_c}')
    expect(nodes[0].children[0].nameString).toBe('d')
  })

  it('keeps the hash tag together when a prefix length is set', () => {
    const nodes = buildTree(['{portal2:co}:something'], 5)

    expect(nodes[0].nameString).toBe('{portal2:co}')
    expect(nodes[0].children[0].isLeaf).toBe(true)
  })

  it('lets a prefix length extend the first folder past the hash tag', () => {
    const nodes = buildTree(['{tenant:x}:app:resource'], 11)

    expect(nodes[0].nameString).toBe('{tenant:x}:app')
    expect(nodes[0].children[0].isLeaf).toBe(true)
  })
  it('finds an overlapping delimiter match after the prefix threshold', () => {
    const nodes = buildTree(['aaa{x}:z'], 1, 'aa')

    expect(nodes[0].nameString).toBe('a')
    expect(nodes[0].isLeaf).toBeUndefined()
    expect(nodes[0].children).toHaveLength(1)
    expect(nodes[0].children[0].isLeaf).toBe(true)
  })

  it('keeps prefix behaviour when the threshold lands on a delimiter', () => {
    const nodes = buildTree(['{a:b}:c:d'], 6)

    expect(nodes[0].nameString).toBe('{a:b}:c')
    expect(nodes[0].children[0].isLeaf).toBe(true)
  })

  it('finds an overlapping delimiter match after a rejected one', () => {
    const nodes = removeIds(
      constructKeysToTree({
        items: [
          { nameString: '{aa}:x', type: KeyTypes.Hash, ttl: -1, size: 0 },
        ] as unknown as IKeyPropTypes[],
        delimiterPattern: 'aa|a}',
        delimiters: ['aa', 'a}'],
      }),
    )

    expect(nodes[0].nameString).toBe('{a')
    expect(nodes[0].children[0].isLeaf).toBe(true)
  })

  it('keeps overlapping matches rejected while they stay inside the hash tag', () => {
    const nodes = removeIds(
      constructKeysToTree({
        items: [
          { nameString: '{aab}aay', type: KeyTypes.Hash, ttl: -1, size: 0 },
        ] as unknown as IKeyPropTypes[],
        delimiterPattern: 'aa|ab',
        delimiters: ['aa', 'ab'],
      }),
    )

    expect(nodes[0].nameString).toBe('{aab}')
    expect(nodes[0].children[0].isLeaf).toBe(true)
  })
})
