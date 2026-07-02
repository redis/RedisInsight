import { HttpException } from '@nestjs/common';
import { sanitizeMessage } from '../utils';
import { CustomErrorCodes } from 'src/constants';

export class UnableToCreateLocalServerException extends HttpException {
  constructor(message = '') {
    const prepend = 'Unable to create local server.';
    const sanitizedMessage = sanitizeMessage(message);
    super(
      {
        message: `${prepend} ${sanitizedMessage}`,
        name: 'UnableToCreateLocalServerException',
        statusCode: 500,
        errorCode: CustomErrorCodes.UnableToCreateLocalServer,
      },
      500,
    );
  }
}
