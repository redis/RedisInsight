import { faker } from '@faker-js/faker'
import { localStorageService } from 'uiSrc/services'
import BrowserStorageItem from 'uiSrc/constants/storage'

import { createEmptyDecoder } from './constants'
import {
  getValueDecoderRules,
  getValueDecoderRulesStorageKey,
  removeValueDecoderRules,
  setValueDecoderRules,
} from './valueDecoderStorage'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  localStorageService: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
}))

const mockGet = localStorageService.get as jest.Mock
const mockSet = localStorageService.set as jest.Mock
const mockRemove = localStorageService.remove as jest.Mock

describe('valueDecoderStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('reads rules from a per-instance storage key', () => {
    const instanceId = faker.string.uuid()
    const rules = [createEmptyDecoder('user:*')]

    mockGet.mockImplementation((key: string) => {
      if (key === getValueDecoderRulesStorageKey(instanceId)) {
        return rules
      }

      return null
    })

    expect(getValueDecoderRules(instanceId)).toEqual(rules)
  })

  it('stores rules per instanceId', () => {
    const instanceId = faker.string.uuid()
    const rules = [createEmptyDecoder('session:*')]

    setValueDecoderRules(instanceId, rules)

    expect(mockSet).toHaveBeenCalledWith(
      BrowserStorageItem.valueDecoderRules + instanceId,
      rules,
    )
  })

  it('returns empty rules when instanceId is missing', () => {
    expect(getValueDecoderRules('')).toEqual([])
    expect(mockSet).not.toHaveBeenCalled()
  })

  it('migrates legacy global rules into the current database once', () => {
    const instanceId = faker.string.uuid()
    const legacyRules = [createEmptyDecoder('legacy:*')]

    mockGet.mockImplementation((key: string) => {
      if (key === getValueDecoderRulesStorageKey(instanceId)) {
        return null
      }

      if (key === 'valueDecoderRules') {
        return legacyRules
      }

      return null
    })

    expect(getValueDecoderRules(instanceId)).toEqual(legacyRules)
    expect(mockSet).toHaveBeenCalledWith(
      getValueDecoderRulesStorageKey(instanceId),
      legacyRules,
    )
    expect(mockRemove).toHaveBeenCalledWith('valueDecoderRules')
  })

  it('removes per-instance rules when a database is deleted', () => {
    const instanceId = faker.string.uuid()

    removeValueDecoderRules(instanceId)

    expect(mockRemove).toHaveBeenCalledWith(
      getValueDecoderRulesStorageKey(instanceId),
    )
  })
})
