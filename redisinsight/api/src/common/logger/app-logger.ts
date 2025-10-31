import { LoggerService, Injectable } from '@nestjs/common';
import { WinstonModule, WinstonModuleOptions } from 'nest-winston';
import { cloneDeep, isString } from 'lodash';
import { ClientMetadata, SessionMetadata } from 'src/common/models';
import { instanceToPlain } from 'class-transformer';
import { logDataToPlain } from 'src/utils/logsFormatter';

type LogMeta = object;

type ErrorOrMeta = Error | LogMeta | string | ClientMetadata | SessionMetadata;

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger: ReturnType<typeof WinstonModule.createLogger>;

  constructor(loggerConfig: WinstonModuleOptions) {
    this.logger = WinstonModule.createLogger(loggerConfig);
  }

  /**
   * Get context from optional arguments
   * If the last argument is a string - it will be handled like a context
   * since nest passes the logger context as the last argument
   * Note: args array might be mutated
   * @param args
   */
  static getContext(args: ErrorOrMeta[] = []) {
    const lastArg = args?.[args.length - 1];

    if (isString(lastArg)) {
      return args.pop() as string;
    }

    return null;
  }

  /**
   * Get an error from the optional arguments
   * Will find first entry which is error type
   * Note: args array might be mutated
   * @param args
   */
  static getError(args: ErrorOrMeta[] = []): Error {
    let error = null;
    const index = args.findIndex((arg) => arg instanceof Error);
    if (index > -1) {
      [error] = args.splice(index, 1);
    }

    return error || undefined;
  }

  /**
   * Get clientMetadata and/or sessionMetadata object(s) from args
   * Will find first entry of ClientMetadata and get SessionMetadata, from it and return both
   * otherwise will find SessionMetadata and return only it
   * otherwise will return empty object
   * Note: args array might be mutated
   * @param args
   */
  static getUserMetadata(args: ErrorOrMeta[] = []): {
    clientMetadata?: Partial<ClientMetadata>;
    sessionMetadata?: SessionMetadata;
  } {
    // check for client metadata in args
    const clientMetadataIndex = args.findIndex(
      (arg) => arg instanceof ClientMetadata,
    );
    if (clientMetadataIndex > -1) {
      const [clientMetadata] = args.splice(
        clientMetadataIndex,
        1,
      ) as ClientMetadata[];
      return {
        clientMetadata: {
          ...clientMetadata,
          sessionMetadata: undefined,
        },
        sessionMetadata: clientMetadata.sessionMetadata,
      };
    }

    // check for session metadata in args
    const sessionMetadataIndex = args.findIndex(
      (arg) => arg instanceof SessionMetadata,
    );
    if (sessionMetadataIndex > -1) {
      const [sessionMetadata] = args.splice(
        sessionMetadataIndex,
        1,
      ) as SessionMetadata[];
      return {
        sessionMetadata,
      };
    }

    // by default will return empty object
    return {};
  }

  private parseLoggerArgs(message: string, optionalParams: ErrorOrMeta[] = []) {
    const optionalParamsCopy = cloneDeep(optionalParams);
    const context = AppLogger.getContext(optionalParamsCopy);
    const error = AppLogger.getError(optionalParamsCopy);
    const userMetadata = AppLogger.getUserMetadata(optionalParamsCopy);

    return {
      message,
      context,
      error,
      ...instanceToPlain(userMetadata),
      data: optionalParamsCopy?.length
        ? logDataToPlain(optionalParamsCopy)
        : undefined,
    };
  }

  /**
   * Write a 'log' level log.
   */
  log(message: string, ...optionalParams: ErrorOrMeta[]) {
    this.logger.log(this.parseLoggerArgs(message, optionalParams));
  }

  /**
   * Write a 'fatal' level log.
   */
  fatal(message: string, ...optionalParams: ErrorOrMeta[]) {
    this.logger.fatal(this.parseLoggerArgs(message, optionalParams));
  }

  /**
   * Write an 'error' level log.
   */
  error(message: string, ...optionalParams: ErrorOrMeta[]) {
    this.logger.error(this.parseLoggerArgs(message, optionalParams));
  }

  /**
   * Write a 'warn' level log.
   */
  warn(message: string, ...optionalParams: ErrorOrMeta[]) {
    this.logger.warn(this.parseLoggerArgs(message, optionalParams));
  }

  /**
   * Write a 'debug' level log.
   */
  debug?(message: string, ...optionalParams: ErrorOrMeta[]) {
    this.logger.debug(this.parseLoggerArgs(message, optionalParams));
  }

  /**
   * Write a 'verbose' level log.
   */
  verbose?(message: string, ...optionalParams: ErrorOrMeta[]) {
    this.logger.verbose(this.parseLoggerArgs(message, optionalParams));
  }
}
