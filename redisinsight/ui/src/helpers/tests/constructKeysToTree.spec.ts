import {
  constructKeysToTreeMockResult,
  delimiterMock,
} from './constructKeysToTreeMockResult'
import { constructKeysToTree } from '../constructKeysToTree'

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
