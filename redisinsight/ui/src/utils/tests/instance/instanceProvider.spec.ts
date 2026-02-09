import { isAzureDatabase } from 'uiSrc/utils'
import { DBInstanceFactory } from 'uiSrc/mocks/factories/database/DBInstance.factory'

// "as any" is used for providerDetails because Instance extends Partial<DatabaseInstanceResponse>
// from the API, which types providerDetails with CloudProvider and AzureAuthType enums.
// These enums can't be imported directly in UI tests due to API module path resolution issues.
describe('isAzureDatabase', () => {
  it('should return true when providerDetails.provider is "azure"', () => {
    const instance = DBInstanceFactory.build({
      providerDetails: {
        provider: 'azure',
        authType: 'entraId',
      } as any,
    })

    expect(isAzureDatabase(instance)).toBe(true)
  })

  it('should return true when providerDetails.provider is "azure" with access-key auth', () => {
    const instance = DBInstanceFactory.build({
      providerDetails: {
        provider: 'azure',
        authType: 'accessKey',
      } as any,
    })

    expect(isAzureDatabase(instance)).toBe(true)
  })

  it('should return false when providerDetails is undefined', () => {
    const instance = DBInstanceFactory.build({
      providerDetails: undefined,
    })

    expect(isAzureDatabase(instance)).toBe(false)
  })

  it('should return false when instance is null', () => {
    expect(isAzureDatabase(null)).toBe(false)
  })

  it('should return false when instance is undefined', () => {
    expect(isAzureDatabase(undefined as any)).toBe(false)
  })

  it('should return false when providerDetails has different provider', () => {
    const instance = DBInstanceFactory.build({
      providerDetails: {
        provider: 'aws',
        authType: 'some-auth',
      } as any,
    })

    expect(isAzureDatabase(instance)).toBe(false)
  })

  it('should return false for empty object instance', () => {
    expect(isAzureDatabase({})).toBe(false)
  })
})
