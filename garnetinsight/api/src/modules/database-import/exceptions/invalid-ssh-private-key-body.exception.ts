import { HttpException } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class InvalidSshPrivateKeyBodyException extends HttpException {
  constructor(message: string = ERROR_MESSAGES.INVALID_SSH_PRIVATE_KEY_BODY) {
    const response = {
      message,
      statusCode: 400,
      error: 'Invalid SSH Private Key Body',
    };

    super(response, 400);
  }
}
