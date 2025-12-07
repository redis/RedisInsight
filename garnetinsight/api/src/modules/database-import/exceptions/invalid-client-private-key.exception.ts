import { HttpException } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class InvalidClientPrivateKeyException extends HttpException {
  constructor(message: string = ERROR_MESSAGES.INVALID_PRIVATE_KEY) {
    const response = {
      message,
      statusCode: 400,
      error: 'Invalid Client Private Key',
    };

    super(response, 400);
  }
}
