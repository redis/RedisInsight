import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export class AzureEntraIdTokenExpiredException extends HttpException {
  constructor(
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
      },
    };

    super(response, response.statusCode, options);
  }
}
