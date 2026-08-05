import { faker } from '@faker-js/faker'

import {
  getIndexOptionLabel,
  getIndexOptionsWidth,
  matchesIndexSearch,
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

describe('matchesIndexSearch', () => {
  it('should match on the index name, case-insensitively', () => {
    expect(matchesIndexSearch('idx:Restaurant', 'restaur')).toBe(true)
    expect(matchesIndexSearch('idx:Restaurant', 'bicycle')).toBe(false)
  })

  it('should match an unnamed index by its displayed label', () => {
    expect(matchesIndexSearch('', 'empty')).toBe(true)
  })

  it('should keep an unnamed index reachable for any term it displays', () => {
    // '' matches no term by name alone, which would hide the option entirely
    expect(matchesIndexSearch('', 'name')).toBe(true)
    expect(matchesIndexSearch('', 'bicycle')).toBe(false)
  })

  it('should treat a whitespace-only term as no filter', () => {
    expect(matchesIndexSearch('idx:bicycle', ' ')).toBe(true)
    expect(matchesIndexSearch('idx:bicycle', '   ')).toBe(true)
  })

  it('should ignore padding around a real term', () => {
    expect(matchesIndexSearch('idx:bicycle', '  bicycle  ')).toBe(true)
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
