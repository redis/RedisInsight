import { HttpException, HttpStatus } from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';

export class WindowUnauthorizedException extends HttpException {
  constructor(message) {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        errorCode: CustomErrorCodes.WindowUnauthorized,
        message,
        error: 'Window Unauthorized',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
