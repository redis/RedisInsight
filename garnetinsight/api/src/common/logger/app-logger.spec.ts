import { plainToInstance } from 'class-transformer';
import { cloneDeep } from 'lodash';
import { WinstonModule } from 'nest-winston';
import { AppLogger } from 'src/common/logger/app-logger';
import {
  ClientContext,
  ClientMetadata,
  SessionMetadata,
} from 'src/common/models';

const loggerConfig = {};
const mockWinstonLogger = {
  log: jest.fn(),
  verbose: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  fatal: jest.fn(),
};
const logLevels = Object.keys(mockWinstonLogger);

jest.spyOn(WinstonModule, 'createLogger').mockReturnValue(mockWinstonLogger);

const getSessionMetadata = () =>
  plainToInstance(
    SessionMetadata,
    {
      userId: '123',
      sessionId: 'test-session-id',
      requestMetadata: {
        any: 'data',
      },
    },
    { groups: ['security'] },
  );

const getClientMetadata = () =>
  plainToInstance(
    ClientMetadata,
    {
      sessionMetadata: getSessionMetadata(),
      databaseId: 'db-123',
      context: ClientContext.Browser,
      uniqueId: 'unique-id',
      db: 1,
    },
    { groups: ['security'] },
  );

describe('AppLogger', () => {
  let logger: AppLogger;

  beforeEach(() => {
    logger = new AppLogger(loggerConfig);
    jest.clearAllMocks();
  });

  test.each(logLevels)(
    'should get context from last optional param if it is a string - logger.%s',
    (level) => {
      logger[level]('Test message', 'optional arg', 'Test context');

      expect(mockWinstonLogger[level]).toHaveBeenCalledTimes(1);
      expect(mockWinstonLogger[level]).toHaveBeenCalledWith({
        message: 'Test message',
        context: 'Test context',
        data: ['optional arg'],
        error: undefined,
      });
    },
  );

  test.each(logLevels)(
    'should find and separate the first error object if exists - logger.%s',
    (level) => {
      const error1 = new Error('Test error 1');
      const error2 = new Error('Test error 2');
      logger[level]('Test message', error1, error2);

      expect(mockWinstonLogger[level]).toHaveBeenCalledTimes(1);
      expect(mockWinstonLogger[level]).toHaveBeenCalledWith({
        message: 'Test message',
        context: null,
        data: [error2],
        error: error1,
      });
    },
  );

  test.each(logLevels)(
    'should get error response and include it if exists - logger.%s',
    (level) => {
      const error1 = new Error('Test error 1');
      (error1 as Error & { response: unknown }).response = {
        status: 500,
        data: 'Internal server error',
      };
      logger[level]('Test message', error1);

      expect(mockWinstonLogger[level]).toHaveBeenCalledTimes(1);
      expect(mockWinstonLogger[level]).toHaveBeenCalledWith({
        message: 'Test message',
        context: null,
        data: undefined,
        error: error1,
      });
    },
  );

  test.each(logLevels)(
    'should parse client metadata from optional params - logger.%s',
    (level) => {
      const clientMetadata = getClientMetadata();
      logger[level](
        'Test message',
        clientMetadata,
        { foo: 'bar' },
        'Test context',
      );

      expect(mockWinstonLogger[level]).toHaveBeenCalledTimes(1);
      expect(mockWinstonLogger[level]).toHaveBeenCalledWith({
        message: 'Test message',
        context: 'Test context',
        clientMetadata: {
          ...clientMetadata,
          sessionMetadata: undefined,
        },
        sessionMetadata: {
          ...clientMetadata.sessionMetadata,
          requestMetadata: undefined,
        },
        data: [{ foo: 'bar' }],
        error: undefined,
      });
    },
  );

  test.each(logLevels)(
    'should parse session metadata from optional params - logger.%s',
    (level) => {
      const sessionMetadata = getSessionMetadata();
      logger[level](
        'Test message',
        sessionMetadata,
        { foo: 'bar' },
        'Test context',
      );

      expect(mockWinstonLogger[level]).toHaveBeenCalledTimes(1);
      expect(mockWinstonLogger[level]).toHaveBeenCalledWith({
        message: 'Test message',
        context: 'Test context',
        sessionMetadata: {
          ...sessionMetadata,
          requestMetadata: undefined,
        },
        data: [{ foo: 'bar' }],
        error: undefined,
      });
    },
  );

  test.each(logLevels)(
    'should not mutate original arguments - logger.%s',
    (level) => {
      const clientMetadata = getClientMetadata();

      const error = new Error('test 123');
      const optionalParams = [
        clientMetadata,
        error,
        { foo: 'bar' },
        'Test context',
      ];
      const optionalParamsOriginal = cloneDeep(optionalParams);

      logger[level]('Test message', ...optionalParams);

      expect(mockWinstonLogger[level]).toHaveBeenCalledTimes(1);
      expect(mockWinstonLogger[level]).toHaveBeenCalledWith({
        message: 'Test message',
        context: 'Test context',
        clientMetadata: {
          ...clientMetadata,
          sessionMetadata: undefined,
        },
        sessionMetadata: {
          ...clientMetadata.sessionMetadata,
          requestMetadata: undefined,
        },
        data: [{ foo: 'bar' }],
        error,
      });
      expect(optionalParams).toEqual(optionalParamsOriginal);
    },
  );
});
