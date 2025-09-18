import { format } from 'winston';
import { omit, isString } from 'lodash';
import { inspect } from 'util';
import config, { Config } from 'src/utils/config';

const LOGGER_CONFIG = config.get('logger') as Config['logger'];

type SanitizeOptions = {
  omitSensitiveData?: boolean;
};

type SanitizedError = {
  type: string;
  message: string;
  stack?: string;
  cause?: ReturnType<typeof sanitizeError>;
};

export const getOriginalErrorCause = (cause: unknown): Error | undefined => {
  if (cause instanceof Error) {
    return getOriginalErrorCause((cause as any).cause) || cause;
  }
  return undefined;
};

export const sanitizeError = (error?: Error, opts: SanitizeOptions = {} ): SanitizedError | undefined => {
  if (!error) return undefined;

  return {
    type: error.constructor?.name ?? 'UnknownError',
    message: error.message,
    stack: opts.omitSensitiveData ? undefined : error.stack,
    cause: sanitizeError(getOriginalErrorCause((error as any).cause), opts),
  };
};

export const sanitizeErrors = <T>(obj: T, opts: SanitizeOptions = {}, seen = new WeakMap<any, any>()): T => {
  if (obj instanceof Error) {
    return sanitizeError(obj, opts) as unknown as T;
  }

  if (obj === null || typeof obj !== 'object') return obj;

  if (seen.has(obj)) {
    return '[Circular]' as unknown as T;
  }

  const clone: any = Array.isArray(obj) ? [] : {};
  seen.set(obj, clone);

  Object.keys(obj).forEach(key => {
    clone[key] = sanitizeErrors(obj[key], opts, seen);
  });

  return clone;
};

export const prepareLogsData = format((info, opts: SanitizeOptions = {}) => {
  return sanitizeErrors(info, opts);
});

export const prettyFileFormat = format.printf((info) => {
  const separator = ' | ';
  const timestamp = new Date().toLocaleString();
  const { level, context, message } = info;

  const logData = [
    timestamp,
    `${level}`.toUpperCase(),
    context,
    message,
    inspect(omit(info, ['timestamp', 'level', 'context', 'message', 'stack']), { depth: LOGGER_CONFIG.logDepthLevel }),
  ];

  return logData.join(separator);
});
