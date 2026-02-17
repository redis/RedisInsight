import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { MsEntraIdErrorCode } from '../constants';

export interface ParsedAzureOAuthError {
  message: string;
  errorCode: CustomErrorCodes;
  msErrorCode?: MsEntraIdErrorCode;
}

const MS_ERROR_MAPPING: Record<
  MsEntraIdErrorCode,
  { errorCode: CustomErrorCodes; messageKey: keyof typeof ERROR_MESSAGES }
> = {
  [MsEntraIdErrorCode.InvalidResource]: {
    errorCode: CustomErrorCodes.AzureOAuthPermissionError,
    messageKey: 'AZURE_OAUTH_PERMISSION_ERROR',
  },
  [MsEntraIdErrorCode.ConsentRequired]: {
    errorCode: CustomErrorCodes.AzureOAuthConsentRequired,
    messageKey: 'AZURE_OAUTH_CONSENT_REQUIRED',
  },
  [MsEntraIdErrorCode.AdminConsentRequired]: {
    errorCode: CustomErrorCodes.AzureOAuthAdminConsentRequired,
    messageKey: 'AZURE_OAUTH_ADMIN_CONSENT_REQUIRED',
  },
  [MsEntraIdErrorCode.UserDeclinedConsent]: {
    errorCode: CustomErrorCodes.AzureOAuthUserDeclinedConsent,
    messageKey: 'AZURE_OAUTH_USER_DECLINED_CONSENT',
  },
  [MsEntraIdErrorCode.MfaRequired]: {
    errorCode: CustomErrorCodes.AzureOAuthMfaRequired,
    messageKey: 'AZURE_OAUTH_MFA_REQUIRED',
  },
  [MsEntraIdErrorCode.MfaEnrollmentRequired]: {
    errorCode: CustomErrorCodes.AzureOAuthMfaEnrollmentRequired,
    messageKey: 'AZURE_OAUTH_MFA_ENROLLMENT_REQUIRED',
  },
  [MsEntraIdErrorCode.BlockedByConditionalAccess]: {
    errorCode: CustomErrorCodes.AzureOAuthBlockedByPolicy,
    messageKey: 'AZURE_OAUTH_BLOCKED_BY_POLICY',
  },
  [MsEntraIdErrorCode.AppNotFound]: {
    errorCode: CustomErrorCodes.AzureOAuthAppNotFound,
    messageKey: 'AZURE_OAUTH_APP_NOT_FOUND',
  },
};

// Regex to detect any AADSTS error code (e.g., AADSTS50126, AADSTS50053)
const AADSTS_REGEX = /AADSTS\d+/i;

/**
 * Parse an Azure OAuth error string and return structured error information.
 * Detects specific Microsoft Entra ID error codes (AADSTS*) and maps them to
 * user-friendly messages and internal error codes.
 *
 * @param error - The error string from Azure OAuth response
 * @param errorDescription - Optional error description with more details
 * @returns Parsed error with message, error code, and MS error code if an
 *          AADSTS error is found, or null for non-AADSTS errors
 */
export const parseAzureOAuthError = (
  error: string,
  errorDescription?: string,
): ParsedAzureOAuthError | null => {
  const description = errorDescription || error || '';

  // First, check for known AADSTS errors with specific handling
  for (const msErrorCode of Object.values(MsEntraIdErrorCode)) {
    if (description.includes(msErrorCode)) {
      const mapping = MS_ERROR_MAPPING[msErrorCode];
      return {
        message: ERROR_MESSAGES[mapping.messageKey] as string,
        errorCode: mapping.errorCode,
        msErrorCode,
      };
    }
  }

  // Check for any AADSTS error (unknown codes) - these should still be treated
  // as Azure OAuth errors, not as token expiry
  if (AADSTS_REGEX.test(description)) {
    return {
      message: `${ERROR_MESSAGES.AZURE_OAUTH_UNKNOWN_ERROR} ${description}`,
      errorCode: CustomErrorCodes.AzureOAuthUnknownError,
    };
  }

  // Return null for non-AADSTS errors to allow caller to handle them differently
  // (e.g., token expiry errors should use AzureEntraIdTokenExpiredException)
  return null;
};
