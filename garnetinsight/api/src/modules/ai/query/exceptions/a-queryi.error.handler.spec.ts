import { AxiosError } from 'axios';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import {
  mockAiChatAccessDeniedError,
  mockAiChatBadRequestError,
  mockAiChatInternalServerError,
  mockAiChatUnauthorizedError,
} from 'src/__mocks__';
import {
  AiQueryBadRequestException,
  AiQueryForbiddenException,
  AiQueryInternalServerErrorException,
  AiQueryNotFoundException,
  AiQueryRateLimitMaxTokensException,
  AiQueryRateLimitRequestException,
  AiQueryRateLimitTokenException,
  AiQueryUnauthorizedException,
} from 'src/modules/ai/query/exceptions';
import { AiQueryServerErrors } from 'src/modules/ai/query/models';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { wrapAiQueryError } from './ai-query.error.handler';

describe('wrapConvAiError', () => {
  it('Should return AiQueryBadRequestException of status code is 400', async () => {
    const error = wrapAiQueryError(mockAiChatBadRequestError);
    expect(error).toBeInstanceOf(AiQueryBadRequestException);
    expect(error).toEqual(new AiQueryBadRequestException());
  });
  it('Should return AiQueryUnauthorizedException of status code is 401', async () => {
    const error = wrapAiQueryError(mockAiChatUnauthorizedError);
    expect(error).toBeInstanceOf(AiQueryUnauthorizedException);
    expect(error).toEqual(new AiQueryUnauthorizedException());
  });
  it('Should return AiQueryForbiddenException of status code is 403', async () => {
    const error = wrapAiQueryError(mockAiChatAccessDeniedError);
    expect(error).toBeInstanceOf(AiQueryForbiddenException);
    expect(error).toEqual(new AiQueryForbiddenException());
  });
  it('Should return AiQueryNotFoundException if statusCode is 404', async () => {
    const error = wrapAiQueryError({
      message: 'Requested resource was not found',
      response: {
        statusCode: 404,
      },
    });
    expect(error).toBeInstanceOf(AiQueryNotFoundException);
    expect(error).toEqual(new AiQueryNotFoundException());
  });
  it('Should return AiQueryInternalServerErrorException of status code is 500', async () => {
    const error = wrapAiQueryError(mockAiChatInternalServerError);
    expect(error).toBeInstanceOf(AiQueryInternalServerErrorException);
    expect(error).toEqual(new AiQueryInternalServerErrorException());
  });
  it('Should return AiQueryInternalServerErrorException by default', async () => {
    const mockAxiosError = {
      response: {
        status: 503,
        data: {
          message: 'Unreachable error',
        },
      },
    } as AxiosError;

    const error = wrapAiQueryError(mockAxiosError);
    expect(error).toBeInstanceOf(AiQueryInternalServerErrorException);
    expect(error).toEqual(new AiQueryInternalServerErrorException());
  });
  it('Should return AiQueryInternalServerErrorException if no response field', async () => {
    const mockAxiosError = new Error('some other error') as AxiosError;

    const error = wrapAiQueryError(mockAxiosError);
    expect(error).toBeInstanceOf(AiQueryInternalServerErrorException);
    expect(error).toEqual(new AiQueryInternalServerErrorException());
  });
  it('Should return HttpException if passed children of it', async () => {
    const mockAxiosError = new BadRequestException() as unknown as AxiosError;

    const error = wrapAiQueryError(mockAxiosError);
    expect(error).toBeInstanceOf(BadRequestException);
    expect(error).toEqual(mockAxiosError);
  });
  it('Should throw AiQueryRateLimitTokenException', async () => {
    const error = wrapAiQueryError({
      error: AiQueryServerErrors.RateLimitToken,
      message: 'Rate limit of user for tokens exceeded',
      data: { limiterType: 'token', limiterKind: 'user', limiterSeconds: 10 },
    });
    expect(error).toBeInstanceOf(AiQueryRateLimitTokenException);
    expect(error.getResponse()).toEqual({
      message: 'Rate limit of user for tokens exceeded',
      statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
      error: 'AiQueryRateLimitToken',
      errorCode: CustomErrorCodes.QueryAiRateLimitToken,
      details: {
        limiterType: 'token',
        limiterKind: 'user',
        limiterSeconds: 10,
      },
    });
  });
  it('Should throw AiQueryRateLimitTokenException with default message', async () => {
    const error = wrapAiQueryError({
      error: AiQueryServerErrors.RateLimitToken,
      data: { limiterType: 'token', limiterKind: 'user', limiterSeconds: 10 },
    });
    expect(error).toBeInstanceOf(AiQueryRateLimitTokenException);
    expect(error.getResponse()).toEqual({
      message: ERROR_MESSAGES.AI_QUERY_TOKEN_RATE_LIMIT,
      statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
      error: 'AiQueryRateLimitToken',
      errorCode: CustomErrorCodes.QueryAiRateLimitToken,
      details: {
        limiterType: 'token',
        limiterKind: 'user',
        limiterSeconds: 10,
      },
    });
  });
  it('Should throw AiQueryRateLimitRequestException', async () => {
    const error = wrapAiQueryError({
      error: AiQueryServerErrors.RateLimitRequest,
      message: 'Rate limit of user for requests exceeded',
      data: { limiterType: 'request', limiterKind: 'user', limiterSeconds: 1 },
    });
    expect(error).toBeInstanceOf(AiQueryRateLimitRequestException);
    expect(error.getResponse()).toEqual({
      message: 'Rate limit of user for requests exceeded',
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      error: 'AiQueryRateLimitRequest',
      errorCode: CustomErrorCodes.QueryAiRateLimitRequest,
      details: {
        limiterType: 'request',
        limiterKind: 'user',
        limiterSeconds: 1,
      },
    });
  });
  it('Should throw AiQueryRateLimitRequestException with default message', async () => {
    const error = wrapAiQueryError({
      error: AiQueryServerErrors.RateLimitRequest,
      data: { limiterType: 'request', limiterKind: 'user', limiterSeconds: 1 },
    });
    expect(error).toBeInstanceOf(AiQueryRateLimitRequestException);
    expect(error.getResponse()).toEqual({
      message: ERROR_MESSAGES.AI_QUERY_REQUEST_RATE_LIMIT,
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      error: 'AiQueryRateLimitRequest',
      errorCode: CustomErrorCodes.QueryAiRateLimitRequest,
      details: {
        limiterType: 'request',
        limiterKind: 'user',
        limiterSeconds: 1,
      },
    });
  });
  it('Should throw AiQueryRateLimitMaxTokensException', async () => {
    const error = wrapAiQueryError({
      error: AiQueryServerErrors.MaxTokens,
      message: 'Token count exceeds the conversation limit',
      data: { tokenLimit: 20000, tokenCount: 575 },
    });
    expect(error).toBeInstanceOf(AiQueryRateLimitMaxTokensException);
    expect(error.getResponse()).toEqual({
      message: 'Token count exceeds the conversation limit',
      statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
      error: 'AiQueryRateLimitMaxTokens',
      errorCode: CustomErrorCodes.QueryAiRateLimitMaxTokens,
      details: {
        tokenLimit: 20000,
        tokenCount: 575,
      },
    });
  });
  it('Should throw AiQueryRateLimitMaxTokensException with default message', async () => {
    const error = wrapAiQueryError({
      error: AiQueryServerErrors.MaxTokens,
      data: { tokenLimit: 20000, tokenCount: 575 },
    });
    expect(error).toBeInstanceOf(AiQueryRateLimitMaxTokensException);
    expect(error.getResponse()).toEqual({
      message: ERROR_MESSAGES.AI_QUERY_MAX_TOKENS_RATE_LIMIT,
      statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
      error: 'AiQueryRateLimitMaxTokens',
      errorCode: CustomErrorCodes.QueryAiRateLimitMaxTokens,
      details: {
        tokenLimit: 20000,
        tokenCount: 575,
      },
    });
  });
  it('Should throw AiQueryInternalServerErrorException when unsupported rate limiter error', async () => {
    const error = wrapAiQueryError({
      error: 'unsupported',
      message: 'Token count exceeds the conversation limit',
      data: { tokenLimit: 20000, tokenCount: 575 },
    });
    expect(error).toBeInstanceOf(AiQueryInternalServerErrorException);
    expect(error).toEqual(new AiQueryInternalServerErrorException());
  });
  it('additional checks for default values for rate limits errors', async () => {
    expect(new AiQueryRateLimitTokenException().getResponse()).toEqual({
      message: ERROR_MESSAGES.AI_QUERY_TOKEN_RATE_LIMIT,
      statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
      error: 'AiQueryRateLimitToken',
      errorCode: CustomErrorCodes.QueryAiRateLimitToken,
    });
    expect(new AiQueryRateLimitRequestException().getResponse()).toEqual({
      message: ERROR_MESSAGES.AI_QUERY_REQUEST_RATE_LIMIT,
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      error: 'AiQueryRateLimitRequest',
      errorCode: CustomErrorCodes.QueryAiRateLimitRequest,
    });
    expect(new AiQueryRateLimitMaxTokensException().getResponse()).toEqual({
      message: ERROR_MESSAGES.AI_QUERY_MAX_TOKENS_RATE_LIMIT,
      statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
      error: 'AiQueryRateLimitMaxTokens',
      errorCode: CustomErrorCodes.QueryAiRateLimitMaxTokens,
    });
  });
});
