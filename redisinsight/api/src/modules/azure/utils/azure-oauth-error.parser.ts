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

/**
 * Parse an Azure OAuth error string and return structured error information.
 * Detects specific Microsoft Entra ID error codes (AADSTS*) and maps them to
 * user-friendly messages and internal error codes.
 *
 * @param error - The error string from Azure OAuth response
 * @param errorDescription - Optional error description with more details
 * @returns Parsed error with message, error code, and MS error code if a known
 *          AADSTS error is found, or null for non-AADSTS errors
 */
export const parseAzureOAuthError = (
  error: string,
  errorDescription?: string,
): ParsedAzureOAuthError | null => {
  const description = errorDescription || error || '';

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

  // Return null for non-AADSTS errors to allow caller to handle them differently
  // (e.g., token expiry errors should use AzureEntraIdTokenExpiredException)
  return null;
};
