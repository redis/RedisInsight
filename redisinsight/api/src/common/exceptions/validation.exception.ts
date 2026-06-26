import { BadRequestException, HttpStatus } from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';

export class ValidationException extends BadRequestException {
  constructor(message = 'Bad request') {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'Bad Request',
      message,
      errorCode: CustomErrorCodes.ValidationError,
    });
  }
}
