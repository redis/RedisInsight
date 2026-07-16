import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export class AzureEntraIdTokenExpiredException extends HttpException {
  constructor(
    // Realm the expired connection was created for, so interactive recovery
    // re-authenticates against it instead of the home tenant.
    tenantId?: string,
    message = ERROR_MESSAGES.AZURE_ENTRA_ID_TOKEN_EXPIRED,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'AzureEntraIdTokenExpired',
      errorCode: CustomErrorCodes.AzureEntraIdTokenExpired,
      additionalInfo: {
        errorCode: CustomErrorCodes.AzureEntraIdTokenExpired,
        tenantId,
      },
    };

    super(response, response.statusCode, options);
  }
}
