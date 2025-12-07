import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { PubSubWsException } from 'src/modules/pub-sub/errors/pub-sub-ws.exception';

@Catch()
export class AckWsExceptionFilter {
  public catch(exception: HttpException, host: ArgumentsHost) {
    const callback = host.getArgByIndex(2);
    this.handleError(callback, exception);
  }

  public handleError(callback: any, exception: Error) {
    if (callback && typeof callback === 'function') {
      callback({ status: 'error', error: new PubSubWsException(exception) });
    }
  }
}
