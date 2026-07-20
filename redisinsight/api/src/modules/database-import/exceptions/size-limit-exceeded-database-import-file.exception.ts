import { HttpException } from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';

export class SizeLimitExceededDatabaseImportFileException extends HttpException {
  constructor(message: string = 'Invalid import file') {
    const response = {
      message,
      statusCode: 400,
      errorCode: CustomErrorCodes.DatabaseImportSizeLimitExceeded,
      error: 'Invalid Database Import File',
    };

    super(response, 400);
  }
}
