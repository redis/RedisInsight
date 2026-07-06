import { HttpException } from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import { sanitizeMessage } from '../utils';

export class UnableToCreateSshConnectionException extends HttpException {
  constructor(message = '') {
    const prepend = 'Unable to create ssh connection.';
    const sanitizedMessage = sanitizeMessage(message);
    super(
      {
        message: `${prepend} ${sanitizedMessage}`,
        name: 'UnableToCreateSshConnectionException',
        statusCode: 503,
        errorCode: CustomErrorCodes.UnableToCreateSshConnection,
      },
      503,
    );
  }
}
