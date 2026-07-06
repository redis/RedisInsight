import { HttpException } from '@nestjs/common';
import { sanitizeMessage } from '../utils';
import { CustomErrorCodes } from 'src/constants';

export class UnableToCreateTunnelException extends HttpException {
  constructor(message = '') {
    const prepend = 'Unable to create tunnel.';
    const sanitizedMessage = sanitizeMessage(message);
    super(
      {
        message: `${prepend} ${sanitizedMessage}`,
        name: 'UnableToCreateTunnelException',
        statusCode: 500,
        errorCode: CustomErrorCodes.UnableToCreateTunnel,
      },
      500,
    );
  }
}
