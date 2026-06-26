import { HttpException } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export class InvalidCertificateNameException extends HttpException {
  constructor(
    message: string = ERROR_MESSAGES.CERTIFICATE_NAME_IS_NOT_DEFINED,
  ) {
    const response = {
      message,
      statusCode: 400,
      errorCode: CustomErrorCodes.DatabaseImportInvalidCertificateName,
      error: 'Invalid Certificate Name',
    };

    super(response, 400);
  }
}
