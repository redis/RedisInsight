import { NextFunction, Request, Response } from 'express';
import { PayloadTooLargeException, HttpStatus } from '@nestjs/common';
import { getCorsOptions } from 'src/common/utils/cors.util';
import { stampErrorCode } from 'src/exceptions/error-code.util';
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

    const { origin, credentials } = getCorsOptions(
      serverConfig.cors,
      process.env.RI_BUILD_TYPE,
    );

    res.status(HttpStatus.PAYLOAD_TOO_LARGE);

    if (typeof origin === 'string') {
      res
        .set('Access-Control-Allow-Origin', origin)
        .set('Access-Control-Allow-Credentials', `${credentials}`);
    }

    return res.json(stampErrorCode(exception));
  }

  next(err);
};
