import { HttpException } from '@nestjs/common';

export class ClientNotFoundErrorException extends HttpException {
  constructor(
    response: string | Record<string, any> = {
      message: 'Client not found or it has been disconnected.',
      name: 'ClientNotFoundError',
      statusCode: 404,
    },
    status = 404,
  ) {
    super(response, status);
  }
}
