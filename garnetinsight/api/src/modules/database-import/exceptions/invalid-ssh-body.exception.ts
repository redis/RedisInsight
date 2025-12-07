import { HttpException } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class InvalidSshBodyException extends HttpException {
  constructor(message: string = ERROR_MESSAGES.INVALID_SSH_BODY) {
    const response = {
      message,
      statusCode: 400,
      error: 'Invalid SSH body',
    };

    super(response, 400);
  }
}
