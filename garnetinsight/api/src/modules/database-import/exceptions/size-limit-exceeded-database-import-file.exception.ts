import { HttpException } from '@nestjs/common';

export class SizeLimitExceededDatabaseImportFileException extends HttpException {
  constructor(message: string = 'Invalid import file') {
    const response = {
      message,
      statusCode: 400,
      error: 'Invalid Database Import File',
    };

    super(response, 400);
  }
}
