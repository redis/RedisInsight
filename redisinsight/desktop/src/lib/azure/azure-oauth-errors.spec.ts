import { mapKnownAzureAdError } from './azure-oauth-errors'

describe('mapKnownAzureAdError', () => {
  describe('known Microsoft AADSTS errors', () => {
    it('should return user-friendly message for AADSTS650057 (invalid resource)', () => {
      const microsoftError =
        'AADSTS650057: Invalid resource. The client has requested access to a resource which is not listed. Trace ID: abc123'

      const result = mapKnownAzureAdError(microsoftError)

      expect(result).toBe(
        'Azure authentication failed. The application is not properly configured for Azure Redis access. Please contact support.',
      )
    })

    it('should return user-friendly message for AADSTS65004 (user denied consent)', () => {
      const microsoftError =
        'AADSTS65004: User declined to consent to access the app.'

      const result = mapKnownAzureAdError(microsoftError)

      expect(result).toBe(
        'Azure authentication was cancelled or access was denied.',
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
    it('should return default message for undefined input', () => {
      const result = mapKnownAzureAdError(undefined)

      expect(result).toBe('Azure authentication failed. Please try again.')
    })

    it('should handle array input and use first element', () => {
      const errorArray = ['AADSTS650057: Invalid resource', 'Secondary error']

      const result = mapKnownAzureAdError(errorArray)

      expect(result).toBe(
        'Azure authentication failed. The application is not properly configured for Azure Redis access. Please contact support.',
      )
    })
  })
})
