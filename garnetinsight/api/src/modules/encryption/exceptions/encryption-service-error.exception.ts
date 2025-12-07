import { HttpException } from '@nestjs/common';

export class EncryptionServiceErrorException extends HttpException {
  constructor(
    response: string | Record<string, any> = {
      message: 'Encryption service error',
      name: 'EncryptionServiceError',
      statusCode: 500,
    },
    status = 500,
  ) {
    super(response, status);
  }
}
