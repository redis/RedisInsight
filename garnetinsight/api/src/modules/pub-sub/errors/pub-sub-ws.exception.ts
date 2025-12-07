import { HttpException } from '@nestjs/common';
import { isString } from 'lodash';

export class PubSubWsException extends Error {
  status: number;

  name: string;

  constructor(err: Error | string) {
    super();
    this.status = 500;
    this.message = 'Internal server error';
    this.name = this.constructor.name;

    if (isString(err)) {
      this.message = err;
    } else if (err instanceof HttpException) {
      this.message = err.getResponse()['message'];
      this.status = err.getStatus();
      this.name = err.constructor.name;
    } else if (err instanceof Error) {
      this.message = err.message;
      this.name = 'Error';
    }
  }
}
