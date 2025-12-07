import { HttpException } from '@nestjs/common';

export class UnableToParseDatabaseImportFileException extends HttpException {
  constructor(message: string = 'Unable to parse import file') {
    const response = {
      message,
      statusCode: 400,
      error: 'Unable To Parse Database Import File',
    };

    super(response, 400);
  }
}
