import { RedisearchIndexKeyType } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import {
  RedisResponseBuffer,
  RedisResponseBufferType,
} from 'uiSrc/slices/interfaces'

import {
  CreateIndexMode,
  ExistingDataLocationState,
} from '../pages/VectorSearchCreateIndexPage/VectorSearchCreateIndexPage.types'
import { SampleDataContent } from '../components/pick-sample-data-modal/PickSampleDataModal.types'

import {
  extractNamespace,
  deriveIndexName,
  formatPrefixes,
  isExistingDataState,
  isSampleDataState,
  hasPreselectedKey,
} from './helpers'

describe('formatPrefixes', () => {
  it('should format single prefix with quotes', () => {
    const result = formatPrefixes(['user:'])

    expect(result).toBe('"user:"')
  })

  it('should format multiple prefixes with comma separator', () => {
    const result = formatPrefixes(['user:', 'customer:'])

    expect(result).toBe('"user:", "customer:"')
  })

  it('should return empty string for undefined', () => {
    const result = formatPrefixes(undefined)

    expect(result).toBe('')
  })

  it('should return empty string for empty array', () => {
    const result = formatPrefixes([])

    expect(result).toBe('')
  })
})

describe('isExistingDataState', () => {
  it('should return true for existing data state', () => {
    const state = { mode: CreateIndexMode.ExistingData as const }

    const result = isExistingDataState(state)

    expect(result).toBe(true)
  })

  it('should return false for sample data state', () => {
    const state = { sampleData: SampleDataContent.E_COMMERCE_DISCOVERY }

    const result = isExistingDataState(state)

    expect(result).toBe(false)
  })

  it('should return false for undefined', () => {
    const result = isExistingDataState(undefined)

    expect(result).toBe(false)
  })
})

describe('isSampleDataState', () => {
  it('should return true for sample data state', () => {
    const state = { sampleData: SampleDataContent.E_COMMERCE_DISCOVERY }

    const result = isSampleDataState(state)

    expect(result).toBe(true)
  })

  it('should return false for existing data state', () => {
    const state = { mode: CreateIndexMode.ExistingData as const }

    const result = isSampleDataState(state)

    expect(result).toBe(false)
  })

  it('should return false for undefined', () => {
    const result = isSampleDataState(undefined)

    expect(result).toBe(false)
  })
})

describe('hasPreselectedKey', () => {
  it('should return true when existing data state has initialKey', () => {
    const state: ExistingDataLocationState = {
      mode: CreateIndexMode.ExistingData,
      initialKey: { data: [98, 105, 107, 101, 115], type: RedisResponseBufferType.Buffer } as RedisResponseBuffer,
      initialKeyType: RedisearchIndexKeyType.HASH,
    }

    const result = hasPreselectedKey(state)

    expect(result).toBe(true)
  })

  it('should return false when existing data state has no initialKey', () => {
    const state = { mode: CreateIndexMode.ExistingData as const }

    const result = hasPreselectedKey(state)

    expect(result).toBe(false)
  })

  it('should return false for sample data state', () => {
    const state = { sampleData: SampleDataContent.E_COMMERCE_DISCOVERY }

    const result = hasPreselectedKey(state)

    expect(result).toBe(false)
  })

  it('should return false for undefined', () => {
    const result = hasPreselectedKey(undefined)

    expect(result).toBe(false)
  })
})

describe('extractNamespace', () => {
  it('should extract namespace from a simple key', () => {
    const namespace = extractNamespace('bikes:10002')
    expect(namespace).toBe('bikes:')
  })

  it('should extract namespace from a key with multiple separators', () => {
    const namespace = extractNamespace('schools:bmx:large')
    expect(namespace).toBe('schools:bmx:')
  })

  it('should return empty string when key has no separator', () => {
    const namespace = extractNamespace('singlekey')
    expect(namespace).toBe('')
  })

  it('should handle key ending with colon', () => {
    const namespace = extractNamespace('prefix:')
    expect(namespace).toBe('prefix:')
  })

  it('should handle empty string', () => {
    const namespace = extractNamespace('')
    expect(namespace).toBe('')
  })
})

describe('deriveIndexName', () => {
  it('should derive index name from namespace', () => {
    const result = deriveIndexName('bikes:')
    expect(result).toBe('idx:bikes')
  })

  it('should derive index name from multi-level namespace', () => {
    const result = deriveIndexName('schools:bmx:')
    expect(result).toBe('idx:schools:bmx')
  })

  it('should fall back to default when namespace is empty', () => {
    const result = deriveIndexName('')
    expect(result).toBe('idx:myindex')
  })
})
