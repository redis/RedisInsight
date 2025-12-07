import { HttpException } from '@nestjs/common';
import { sanitizeMessage } from '../utils';

export class TunnelConnectionLostException extends HttpException {
  constructor(message = '') {
    const prepend = 'Tunnel connection was lost.';
    const sanitizedMessage = sanitizeMessage(message);
    super(
      {
        message: `${prepend} ${sanitizedMessage}`,
        name: 'TunnelConnectionLostException',
        statusCode: 500,
      },
      500,
    );
  }
}
