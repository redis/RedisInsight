import { HttpException } from '@nestjs/common';

export class NoDatabaseImportFileProvidedException extends HttpException {
  constructor(message: string = 'No import file provided') {
    const response = {
      message,
      statusCode: 400,
      error: 'No Database Import File Provided',
    };

    super(response, 400);
  }
}
