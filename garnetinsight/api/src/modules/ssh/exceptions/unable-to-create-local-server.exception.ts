import { HttpException } from '@nestjs/common';
import { sanitizeMessage } from '../utils';

export class UnableToCreateLocalServerException extends HttpException {
  constructor(message = '') {
    const prepend = 'Unable to create local server.';
    const sanitizedMessage = sanitizeMessage(message);
    super(
      {
        message: `${prepend} ${sanitizedMessage}`,
        name: 'UnableToCreateLocalServerException',
        statusCode: 500,
      },
      500,
    );
  }
}
