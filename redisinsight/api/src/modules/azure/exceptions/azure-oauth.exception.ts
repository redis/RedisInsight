import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

/**
 * Generic Azure OAuth exception for authentication errors.
 * Used to wrap specific Microsoft Entra ID errors (AADSTS*) with appropriate
 * error codes and user-friendly messages.
 */
export class AzureOAuthException extends HttpException {
  constructor(
    message: string = ERROR_MESSAGES.AZURE_OAUTH_UNKNOWN_ERROR,
    errorCode: CustomErrorCodes = CustomErrorCodes.AzureOAuthUnknownError,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.UNAUTHORIZED,
      error: 'AzureOAuthError',
      errorCode,
      additionalInfo: {
        errorCode,
      },
    };

    super(response, response.statusCode, options);
  }
}
