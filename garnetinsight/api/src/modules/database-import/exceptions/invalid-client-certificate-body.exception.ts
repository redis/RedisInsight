import { HttpException } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class InvalidClientCertificateBodyException extends HttpException {
  constructor(message: string = ERROR_MESSAGES.INVALID_CERTIFICATE_BODY) {
    const response = {
      message,
      statusCode: 400,
      error: 'Invalid Client Certificate Body',
    };

    super(response, 400);
  }
}
