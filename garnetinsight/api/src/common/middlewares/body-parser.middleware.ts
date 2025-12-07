import { NextFunction, Request, Response } from 'express';
import { PayloadTooLargeException, HttpStatus } from '@nestjs/common';
import { Config, get } from 'src/utils';

const serverConfig = get('server') as Config['server'];

interface BodyParserError extends Error {
  type?: 'entity.too.large';
}

export default (
  err: BodyParserError,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err.type === 'entity.too.large') {
    const exception = new PayloadTooLargeException(
      `The request is too large. Maximum allowed size is ${serverConfig.maxPayloadSize}`,
    );

    return res
      .status(HttpStatus.PAYLOAD_TOO_LARGE)
      .set('Access-Control-Allow-Origin', serverConfig.cors.origin)
      .set(
        'Access-Control-Allow-Credentials',
        `${serverConfig.cors.credentials}`,
      )
      .json(exception.getResponse());
  }

  next(err);
};
