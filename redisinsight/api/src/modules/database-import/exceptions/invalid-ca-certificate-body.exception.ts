import { HttpException } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export class InvalidCaCertificateBodyException extends HttpException {
  constructor(message: string = ERROR_MESSAGES.INVALID_CA_BODY) {
    const response = {
      message,
      statusCode: 400,
      errorCode: CustomErrorCodes.DatabaseImportInvalidCaCertificateBody,
      error: 'Invalid Ca Certificate Body',
    };

    super(response, 400);
  }
}
