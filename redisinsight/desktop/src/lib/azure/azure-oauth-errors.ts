/**
 * User-friendly messages for known Azure AD error codes.
 * @see https://learn.microsoft.com/en-us/entra/identity-platform/reference-error-codes
 */
const AZURE_AD_ERROR_MESSAGES: Record<string, string> = {
  // Invalid resource - app registration misconfiguration
  AADSTS650057:
    'Azure authentication failed. The application is not properly configured for Azure Redis access. Please contact your administrator.',
  // Invalid scope - requested scope not configured
  AADSTS70011:
    'Azure authentication failed. The requested permissions are not configured. Please contact your administrator.',
  // Invalid reply URL
  AADSTS50011:
    'Azure authentication failed. Invalid redirect configuration. Please contact your administrator.',
  // User consent required
  AADSTS65001:
    'Azure authentication requires consent. Please grant the required permissions and try again.',
  // Application not found (invalid client_id)
  AADSTS70001:
    'Azure authentication failed. The application is not registered. Please contact your administrator.',
  // MFA required
  AADSTS50076:
    'Multi-factor authentication is required. Please complete MFA and try again.',
  // Application not found in directory
  AADSTS700016:
    'Azure authentication failed. The application is not available in your directory. Please contact your administrator.',
  // User denied consent
  AADSTS65004: 'Azure authentication was cancelled or access was denied.',
}

/**
 * Maps known Azure AD (AADSTS) error codes to user-friendly messages.
 * Returns the original error description unchanged for non-Microsoft errors.
 */
export const mapKnownAzureAdError = (
  errorDescription: string | string[] | undefined,
): string => {
  const description = Array.isArray(errorDescription)
    ? errorDescription[0]
    : errorDescription

  if (!description) {
    return 'Azure authentication failed. Please try again.'
  }

  for (const [errorCode, userFriendlyMessage] of Object.entries(
    AZURE_AD_ERROR_MESSAGES,
  )) {
    if (description.includes(errorCode)) {
      return `${userFriendlyMessage} (${errorCode})`
    }
  }

  return description
}
