import { HttpException } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export class InvalidClientPrivateKeyException extends HttpException {
  constructor(message: string = ERROR_MESSAGES.INVALID_PRIVATE_KEY) {
    const response = {
      message,
      statusCode: 400,
      errorCode: CustomErrorCodes.DatabaseImportInvalidClientPrivateKey,
      error: 'Invalid Client Private Key',
    };

    super(response, 400);
  }
}
