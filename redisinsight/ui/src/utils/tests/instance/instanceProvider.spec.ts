import { faker } from '@faker-js/faker'
import { isAzureDatabase } from 'uiSrc/utils'
import { Instance } from 'uiSrc/slices/interfaces'

const createMockInstance = (
  providerDetails?: Instance['providerDetails'],
): Partial<Instance> => ({
  id: faker.string.uuid(),
  host: faker.internet.domainName(),
  port: 6379,
  name: faker.company.name(),
  modules: [],
  version: '7.0.0',
  providerDetails,
})

describe('isAzureDatabase', () => {
  it('should return true when providerDetails.provider is "azure"', () => {
    const instance = createMockInstance({
      provider: 'azure',
      authType: 'entra-id',
    })

    expect(isAzureDatabase(instance)).toBe(true)
  })

  it('should return true when providerDetails.provider is "azure" with access-key auth', () => {
    const instance = createMockInstance({
      provider: 'azure',
      authType: 'access-key',
    })

    expect(isAzureDatabase(instance)).toBe(true)
  })

  it('should return false when providerDetails is undefined', () => {
    const instance = createMockInstance(undefined)

    expect(isAzureDatabase(instance)).toBe(false)
  })

  it('should return false when instance is null', () => {
    expect(isAzureDatabase(null)).toBe(false)
  })

  it('should return false when instance is undefined', () => {
    expect(isAzureDatabase(undefined)).toBe(false)
  })

  it('should return false when providerDetails has different provider', () => {
    const instance = createMockInstance({
      provider: 'aws',
      authType: 'some-auth',
    })

    expect(isAzureDatabase(instance)).toBe(false)
  })

  it('should return false for empty object instance', () => {
    expect(isAzureDatabase({})).toBe(false)
  })
})
