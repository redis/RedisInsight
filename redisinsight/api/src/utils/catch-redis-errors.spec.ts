import {
  RedisConnectionAuthUnsupportedException,
  RedisConnectionClusterNodesUnavailableException,
  RedisConnectionFailedException,
  RedisConnectionIncorrectCertificateException,
  RedisConnectionSentinelMasterRequiredException,
  RedisConnectionTimeoutException,
  RedisConnectionUnauthorizedException,
  RedisConnectionUnavailableException,
} from 'src/modules/redis/exceptions/connection';
import {
  catchRedisSearchError,
  getRedisConnectionException,
} from 'src/utils/catch-redis-errors';
import { ReplyError } from 'src/models';
import { CertificatesErrorCodes, RedisErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('catch-redis-errors', () => {
  describe('getRedisConnectionExceptions', () => {
    const database = { host: '127.0.0.1', port: 6379 };

    const urlPlaceholder = `${database.host}:${database.port}`;

    it.each([
      {
        error: new BadRequestException(),
        output: new BadRequestException(),
      },
      {
        error: new Error('unknown error'),
        output: new RedisConnectionFailedException('unknown error'),
      },
      {
        error: new Error(RedisErrorCodes.SentinelParamsRequired),
        output: new RedisConnectionSentinelMasterRequiredException(),
      },
      {
        error: new Error(RedisErrorCodes.Timeout),
        output: new RedisConnectionTimeoutException(),
      },
      {
        error: new Error('connection timed out'),
        output: new RedisConnectionTimeoutException(),
      },
      {
        error: new Error(RedisErrorCodes.InvalidPassword),
        output: new RedisConnectionUnauthorizedException(),
      },
      {
        error: new Error(RedisErrorCodes.AuthRequired),
        output: new RedisConnectionUnauthorizedException(),
      },
      {
        error: new Error('ERR invalid password'),
        output: new RedisConnectionUnauthorizedException(),
      },
      {
        error: new Error("ERR unknown command 'auth'"),
        output: new RedisConnectionAuthUnsupportedException(),
      },
      {
        error: new Error(RedisErrorCodes.ClusterAllFailedError),
        output: new RedisConnectionClusterNodesUnavailableException(),
      },
      {
        error: new Error(RedisErrorCodes.ConnectionRefused),
        output: new RedisConnectionUnavailableException(
          ERROR_MESSAGES.INCORRECT_DATABASE_URL(urlPlaceholder),
        ),
      },
      {
        error: new Error(RedisErrorCodes.ConnectionNotFound),
        output: new RedisConnectionUnavailableException(
          ERROR_MESSAGES.INCORRECT_DATABASE_URL(urlPlaceholder),
        ),
      },
      {
        error: new Error(RedisErrorCodes.DNSTimeoutError),
        output: new RedisConnectionUnavailableException(
          ERROR_MESSAGES.INCORRECT_DATABASE_URL(urlPlaceholder),
        ),
      },
      {
        error: {
          message: 'some message',
          code: RedisErrorCodes.ConnectionReset,
        },
        output: new RedisConnectionUnavailableException(
          ERROR_MESSAGES.INCORRECT_DATABASE_URL(urlPlaceholder),
        ),
      },
      {
        error: {
          message: 'some message',
          code: CertificatesErrorCodes.IncorrectCertificates,
        },
        output: new RedisConnectionIncorrectCertificateException(
          ERROR_MESSAGES.INCORRECT_CERTIFICATES(urlPlaceholder),
        ),
      },
      {
        error: {
          message: 'some message',
          code: CertificatesErrorCodes.DepthZeroSelfSignedCert,
        },
        output: new RedisConnectionIncorrectCertificateException(
          ERROR_MESSAGES.INCORRECT_CERTIFICATES(urlPlaceholder),
        ),
      },
      {
        error: {
          message: 'some message',
          code: CertificatesErrorCodes.SelfSignedCertInChain,
        },
        output: new RedisConnectionIncorrectCertificateException(
          ERROR_MESSAGES.INCORRECT_CERTIFICATES(urlPlaceholder),
        ),
      },
      {
        error: {
          message: 'some message',
          code: CertificatesErrorCodes.OSSLError,
        },
        output: new RedisConnectionIncorrectCertificateException(
          ERROR_MESSAGES.INCORRECT_CERTIFICATES(urlPlaceholder),
        ),
      },
      {
        error: new Error('SSL error'),
        output: new RedisConnectionIncorrectCertificateException(
          ERROR_MESSAGES.INCORRECT_CERTIFICATES(urlPlaceholder),
        ),
      },
      {
        error: new Error(CertificatesErrorCodes.OSSLError),
        output: new RedisConnectionIncorrectCertificateException(
          ERROR_MESSAGES.INCORRECT_CERTIFICATES(urlPlaceholder),
        ),
      },
      {
        error: new Error(CertificatesErrorCodes.IncorrectCertificates),
        output: new RedisConnectionIncorrectCertificateException(
          ERROR_MESSAGES.INCORRECT_CERTIFICATES(urlPlaceholder),
        ),
      },
      {
        error: new Error('ERR unencrypted connection is prohibited'),
        output: new RedisConnectionIncorrectCertificateException(
          ERROR_MESSAGES.INCORRECT_CERTIFICATES(urlPlaceholder),
        ),
      },
    ])('should handle %j', ({ error, output }) => {
      expect(
        getRedisConnectionException(error as ReplyError, database),
      ).toEqual(output);
    });
  });

  describe('catchRedisSearchError', () => {
    it('should throw BadRequestException for Invalid JSONPath error', () => {
      const error = {
        name: 'ReplyError',
        message:
          "Invalid JSONPath 'embedding' in attribute 'embedding' in index 'test_chatbot'",
      } as ReplyError;

      expect(() => catchRedisSearchError(error)).toThrow(BadRequestException);
      expect(() => catchRedisSearchError(error)).toThrow(error.message);
    });

    it('should throw BadRequestException for Bad arguments error', () => {
      const error = {
        name: 'ReplyError',
        message: 'Bad arguments for VECTOR field',
      } as ReplyError;

      expect(() => catchRedisSearchError(error)).toThrow(BadRequestException);
      expect(() => catchRedisSearchError(error)).toThrow(error.message);
    });

    it('should throw BadRequestException for duplicate field error', () => {
      // Actual Redis error: "Duplicate field in schema - title"
      const error = {
        name: 'ReplyError',
        message: 'Duplicate field in schema - title',
      } as ReplyError;

      expect(() => catchRedisSearchError(error)).toThrow(BadRequestException);
      expect(() => catchRedisSearchError(error)).toThrow(error.message);
    });

    it('should throw BadRequestException for missing mandatory parameter error', () => {
      // Actual Redis error: "Missing mandatory parameter: cannot create FLAT index without specifying DIM argument"
      const error = {
        name: 'ReplyError',
        message:
          'Missing mandatory parameter: cannot create FLAT index without specifying DIM argument',
      } as ReplyError;

      expect(() => catchRedisSearchError(error)).toThrow(BadRequestException);
      expect(() => catchRedisSearchError(error)).toThrow(error.message);
    });

    it('should throw BadRequestException for wrong number of arguments error', () => {
      // Actual Redis error: "ERR wrong number of arguments for 'FT.CREATE' command"
      const error = {
        name: 'ReplyError',
        message: "ERR wrong number of arguments for 'FT.CREATE' command",
      } as ReplyError;

      expect(() => catchRedisSearchError(error)).toThrow(BadRequestException);
      expect(() => catchRedisSearchError(error)).toThrow(error.message);
    });

    it('should throw NotFoundException for unknown index error', () => {
      const error = {
        name: 'ReplyError',
        message: 'Unknown index name',
      } as ReplyError;

      expect(() => catchRedisSearchError(error)).toThrow(NotFoundException);
      expect(() => catchRedisSearchError(error)).toThrow(error.message);
    });

    it('should throw NotFoundException for no such index error', () => {
      const error = {
        name: 'ReplyError',
        message: 'idx: no such index',
      } as ReplyError;

      expect(() => catchRedisSearchError(error)).toThrow(NotFoundException);
      expect(() => catchRedisSearchError(error)).toThrow(error.message);
    });

    it('should throw ForbiddenException for NOPERM error', () => {
      const error = {
        name: 'ReplyError',
        message: 'NOPERM this user has no permissions',
      } as ReplyError;

      expect(() => catchRedisSearchError(error)).toThrow(ForbiddenException);
      expect(() => catchRedisSearchError(error)).toThrow(error.message);
    });

    it('should throw InternalServerErrorException for unknown server error', () => {
      const error = {
        name: 'ReplyError',
        message: 'Some unexpected server error',
      } as ReplyError;

      expect(() => catchRedisSearchError(error)).toThrow(
        InternalServerErrorException,
      );
      expect(() => catchRedisSearchError(error)).toThrow(error.message);
    });

    it('should throw BadRequestException for RedisearchLimit error', () => {
      const error = {
        name: 'ReplyError',
        message: RedisErrorCodes.RedisearchLimit,
      } as ReplyError;

      expect(() =>
        catchRedisSearchError(error, { searchLimit: 10000 }),
      ).toThrow(BadRequestException);
    });

    it('should re-throw HttpException if already an HttpException', () => {
      const error = new BadRequestException('Already a bad request');

      expect(() =>
        catchRedisSearchError(error as unknown as ReplyError),
      ).toThrow(BadRequestException);
      expect(() =>
        catchRedisSearchError(error as unknown as ReplyError),
      ).toThrow('Already a bad request');
    });
  });
});
