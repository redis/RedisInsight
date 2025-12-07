import { HttpException, HttpStatus } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class AgreementIsNotDefinedException extends HttpException {
  constructor(message) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        error: 'Bad Request',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ServerInfoNotFoundException extends HttpException {
  constructor(message = ERROR_MESSAGES.SERVER_INFO_NOT_FOUND()) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message,
        error: 'Internal Server Error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
