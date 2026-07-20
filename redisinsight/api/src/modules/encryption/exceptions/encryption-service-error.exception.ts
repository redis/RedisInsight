import { HttpException } from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';

export class EncryptionServiceErrorException extends HttpException {
  constructor(
    response: string | Record<string, any> = {
      message: 'Encryption service error',
      name: 'EncryptionServiceError',
      statusCode: 500,
      errorCode: CustomErrorCodes.EncryptionServiceError,
    },
    status = 500,
  ) {
    super(response, status);
  }
}
