import { getDiffKeysOfObjectValues, getFormUpdates } from 'uiSrc/utils'

const getDiffKeysOfObjectValuesTests: any[] = [
  [{}, {}, []],
  [{ key1: '1' }, { key1: '2' }, ['key1']],
  [{ key1: '1' }, { key2: 2 }, ['key1']],
  [{}, { key2: '1' }, []],
  [{ key1: 1 }, {}, ['key1']],
]

describe('getDiffKeysOfObjectValues', () => {
  it.each(getDiffKeysOfObjectValuesTests)(
    'for input: %s, %s should be output: %s',
    (obj1, obj2, expected) => {
      const result = getDiffKeysOfObjectValues(obj1, obj2)
      expect(result).toEqual(expected)
    },
  )
})

const getFormUpdatesTests: any[] = [
  [{ name: 'name' }, { name: 'name' }, {}],
  [{ name: '' }, { name: 'name' }, { name: '' }],
  [{ name: 'name' }, { name: '' }, { name: 'name' }],
  [{ name: 'name', port: 123 }, { name: '', port: 123 }, { name: 'name' }],
  [
    { name: 'name', port: 123 },
    { name: '', port: 1 },
    { name: 'name', port: 123 },
  ],
  [
    { name: 'name', sshOptions: { password: 123 } },
    { name: '', sshOptions: { password: 123 } },
    { name: 'name' },
  ],
  [
    { name: 'name', sshOptions: { password: 123, name: 'custom' } },
    { name: '', sshOptions: { password: 1, name: 'custom' } },
    { name: 'name', sshOptions: { password: 123 } },
  ],
  [
    {
      name: 'name',
      sshOptions: { password: 123, name: 'custom' },
      nested: { plain: '1', obj2: { plain1: 2, plain2: '2' } },
    },
    {
      name: 'name1',
      sshOptions: { password: 123, name: 'custom' },
      nested: { plain: '2', obj2: { plain1: 2, plain2: '3' } },
    },
    { name: 'name', nested: { plain: '1', obj2: { plain2: '2' } } },
  ],
  [{ arr: [1, 2] }, { arr: [2] }, { arr: [1, 2] }],
]

describe('getFormUpdates', () => {
  it.each(getFormUpdatesTests)(
    'for input: %s (obj), %s (previous), should be output: %s',
    (obj, previous, expected) => {
      const result = getFormUpdates(obj, previous)
      expect(result).toEqual(expected)
    },
  )
})
