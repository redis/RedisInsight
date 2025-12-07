import { map } from 'rxjs/operators';
import {
  CallHandler,
  ClassSerializerInterceptor,
  ExecutionContext,
  PlainLiteralObject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RedisStringResponseEncoding } from 'src/common/constants';

export class BrowserSerializeInterceptor extends ClassSerializerInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const encoding = req?.query?.encoding || RedisStringResponseEncoding.UTF8;

    const contextOptions = this.getContextOptions(context);
    const options = {
      ...this.defaultOptions,
      ...contextOptions,
    };

    if (options?.groups?.length) {
      options.groups.push(encoding);
    } else {
      options.groups = [encoding];
    }

    return next
      .handle()
      .pipe(
        map((res: PlainLiteralObject | Array<PlainLiteralObject>) =>
          this.serialize(res, options),
        ),
      );
  }
}
