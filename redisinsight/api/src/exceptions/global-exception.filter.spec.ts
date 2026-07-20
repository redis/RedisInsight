import { BaseExceptionFilter } from '@nestjs/core';
import {
  ArgumentsHost,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import { GlobalExceptionFilter } from './global-exception.filter';

const mockHost = (url = '/api/databases'): ArgumentsHost =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ url }),
      getResponse: () => ({ status: () => ({ json: () => undefined }) }),
    }),
  }) as unknown as ArgumentsHost;

const errorCodeOf = (exception: HttpException): unknown =>
  (exception.getResponse() as Record<string, unknown>).errorCode;

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let superCatch: jest.SpyInstance;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    // Skip the real BaseExceptionFilter serialization (needs an http adapter).
    superCatch = jest
      .spyOn(BaseExceptionFilter.prototype, 'catch')
      .mockReturnValue(undefined as never);
  });

  afterEach(() => jest.restoreAllMocks());

  it('maps each known status to its generic error code', () => {
    const cases: [HttpException, CustomErrorCodes][] = [
      [new BadRequestException('x'), CustomErrorCodes.GenericBadRequest],
      [new UnauthorizedException('x'), CustomErrorCodes.GenericUnauthorized],
      [new ForbiddenException('x'), CustomErrorCodes.GenericForbidden],
      [new NotFoundException('x'), CustomErrorCodes.GenericNotFound],
      [new ConflictException('x'), CustomErrorCodes.GenericConflict],
    ];

    cases.forEach(([exception, code]) => {
      filter.catch(exception, mockHost());
      expect(errorCodeOf(exception)).toBe(code);
    });
    expect(superCatch).toHaveBeenCalledTimes(cases.length);
  });

  it('computes 12_000 + status for other HttpExceptions (e.g. 500)', () => {
    const exception = new InternalServerErrorException('boom');
    filter.catch(exception, mockHost());
    expect(errorCodeOf(exception)).toBe(CustomErrorCodes.GenericServerError);
  });

  it('upgrades a string HttpException response to an object with a code', () => {
    const exception = new HttpException('Invalid subscription id', 400);
    filter.catch(exception, mockHost());
    // string responses are rebuilt, so inspect the exception delegated to super
    const delegated = superCatch.mock.calls[0][0] as HttpException;
    expect(delegated.getResponse()).toEqual({
      statusCode: 400,
      message: 'Invalid subscription id',
      errorCode: CustomErrorCodes.GenericBadRequest,
    });
  });

  it('uses ValidationError when message is an array (class-validator)', () => {
    const exception = new BadRequestException([
      'port must be a number conforming to the specified constraints',
    ]);
    filter.catch(exception, mockHost());
    expect(errorCodeOf(exception)).toBe(CustomErrorCodes.ValidationError);
  });

  it('does not overwrite an existing custom errorCode', () => {
    const exception = new HttpException(
      {
        message: 'The database already exists.',
        statusCode: 409,
        error: 'DatabaseAlreadyExists',
        errorCode: CustomErrorCodes.DatabaseAlreadyExists,
      },
      409,
    );
    filter.catch(exception, mockHost());
    expect(errorCodeOf(exception)).toBe(CustomErrorCodes.DatabaseAlreadyExists);
  });

  it('leaves non-HttpException errors untouched', () => {
    expect(() =>
      filter.catch(new Error('unexpected'), mockHost()),
    ).not.toThrow();
    expect(superCatch).toHaveBeenCalled();
  });

  it('does not inject a code for the static-asset branch', () => {
    const exception = new NotFoundException('x');
    filter.catch(exception, mockHost('/static/plugins/foo.js'));
    expect(errorCodeOf(exception)).toBeUndefined();
    expect(superCatch).not.toHaveBeenCalled();
  });
});
