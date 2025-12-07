import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  BadGatewayException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import config, { Config } from 'src/utils/config';

const serverConfig = config.get('server') as Config['server'];

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private logger = new Logger('TimeoutInterceptor');

  private readonly message: string;

  private readonly timeout: number;

  constructor(message: string = 'Request timeout', timeoutMs?: number) {
    this.message = message;
    this.timeout = timeoutMs ?? serverConfig.requestTimeout;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(this.timeout),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          const { method, url } = context.switchToHttp().getRequest();
          this.logger.error(`Request Timeout. ${method} ${url}`);
          return throwError(() => new BadGatewayException(this.message));
        }
        return throwError(() => err);
      }),
    );
  }
}
