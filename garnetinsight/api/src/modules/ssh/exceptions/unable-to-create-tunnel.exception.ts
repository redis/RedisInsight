import { HttpException } from '@nestjs/common';
import { sanitizeMessage } from '../utils';

export class UnableToCreateTunnelException extends HttpException {
  constructor(message = '') {
    const prepend = 'Unable to create tunnel.';
    const sanitizedMessage = sanitizeMessage(message);
    super(
      {
        message: `${prepend} ${sanitizedMessage}`,
        name: 'UnableToCreateTunnelException',
        statusCode: 500,
      },
      500,
    );
  }
}
