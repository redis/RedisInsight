import { faker } from '@faker-js/faker'

import {
  getIndexOptionLabel,
  getIndexOptionsWidth,
} from './RediSearchIndexesList.utils'

describe('getIndexOptionLabel', () => {
  it('should return the index name unchanged when it is short', () => {
    const name = `idx:${faker.word.noun()}`

    expect(getIndexOptionLabel(name)).toEqual(name)
  })

  it('should label an unnamed index instead of rendering nothing', () => {
    expect(getIndexOptionLabel('')).not.toEqual('')
  })
})

describe('getIndexOptionsWidth', () => {
  it('should fall back to the trigger width when there are no indexes', () => {
    expect(getIndexOptionsWidth([])).toEqual(
      'max(var(--radix-select-trigger-width), 6ch)',
    )
  })

  it('should size to the longest name so filtering cannot resize the popover', () => {
    const names = ['idx:a', 'idx:abcdefghij', 'idx:abc']

    const width = getIndexOptionsWidth(names)

    expect(width).toEqual('max(var(--radix-select-trigger-width), 20ch)')
    // narrowing the list to any subset keeps the width the longest name asked for
    expect(getIndexOptionsWidth(['idx:abcdefghij'])).toEqual(width)
  })
})
