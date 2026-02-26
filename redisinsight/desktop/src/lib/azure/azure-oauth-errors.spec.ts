import { mapKnownAzureAdError } from './azure-oauth-errors'

describe('mapKnownAzureAdError', () => {
  describe('known Microsoft AADSTS errors', () => {
    it('should return user-friendly message with error code for AADSTS650057', () => {
      const microsoftError =
        'AADSTS650057: Invalid resource. The client has requested access to a resource which is not listed. Trace ID: abc123'

      const result = mapKnownAzureAdError(microsoftError)

      expect(result).toBe(
        'Azure authentication failed. The application is not properly configured for Azure Redis access. Please contact your administrator. (AADSTS650057)',
      )
    })

    it('should return user-friendly message with error code for AADSTS65004', () => {
      const microsoftError =
        'AADSTS65004: User declined to consent to access the app.'

      const result = mapKnownAzureAdError(microsoftError)

      expect(result).toBe(
        'Azure authentication was cancelled or access was denied. (AADSTS65004)',
      )
    })

    it('should correctly match AADSTS700016 instead of AADSTS70001', () => {
      const microsoftError =
        'AADSTS700016: Application with identifier was not found in the directory.'

      const result = mapKnownAzureAdError(microsoftError)

      expect(result).toBe(
        'Azure authentication failed. The application is not available in your directory. Please contact your administrator. (AADSTS700016)',
      )
    })

    it('should correctly match AADSTS70001 when it is the exact error', () => {
      const microsoftError =
        'AADSTS70001: Application is not registered in the tenant.'

      const result = mapKnownAzureAdError(microsoftError)

      expect(result).toBe(
        'Azure authentication failed. The application is not registered. Please contact your administrator. (AADSTS70001)',
      )
    })
  })

  describe('non-Microsoft errors', () => {
    it('should return original error unchanged for non-AADSTS errors', () => {
      const customError = 'Connection timeout while authenticating'

      const result = mapKnownAzureAdError(customError)

      expect(result).toBe(customError)
    })

    it('should return original error for generic OAuth errors', () => {
      const genericError = 'access_denied: User cancelled the request'

      const result = mapKnownAzureAdError(genericError)

      expect(result).toBe(genericError)
    })
  })

  describe('edge cases', () => {
    it('should return default message for undefined input with no error fallback', () => {
      const result = mapKnownAzureAdError(undefined)

      expect(result).toBe('Azure authentication failed. Please try again.')
    })

    it('should return error code when errorDescription is undefined but error is provided', () => {
      const result = mapKnownAzureAdError(undefined, 'access_denied')

      expect(result).toBe('access_denied')
    })

    it('should handle array input and use first element', () => {
      const errorArray = ['AADSTS650057: Invalid resource', 'Secondary error']

      const result = mapKnownAzureAdError(errorArray)

      expect(result).toBe(
        'Azure authentication failed. The application is not properly configured for Azure Redis access. Please contact your administrator. (AADSTS650057)',
      )
    })

    it('should handle array error fallback and use first element', () => {
      const result = mapKnownAzureAdError(undefined, [
        'access_denied',
        'secondary',
      ])

      expect(result).toBe('access_denied')
    })
  })
})
