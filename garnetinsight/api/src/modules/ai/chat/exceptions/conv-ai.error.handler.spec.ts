import { AxiosError } from 'axios';
import {
  ConvAiBadRequestException,
  ConvAiForbiddenException,
  ConvAiUnauthorizedException,
  ConvAiNotFoundException,
  ConvAiInternalServerErrorException,
} from 'src/modules/ai/chat/exceptions';
import { BadRequestException } from '@nestjs/common';
import {
  mockAiChatAccessDeniedError,
  mockAiChatBadRequestError,
  mockAiChatInternalServerError,
  mockAiChatNotFoundError,
  mockAiChatUnauthorizedError,
} from 'src/__mocks__';
import { wrapConvAiError } from './conv-ai.error.handler';

describe('wrapConvAiError', () => {
  it('Should return ConvAiBadRequestException of status code is 400', async () => {
    const error = wrapConvAiError(mockAiChatBadRequestError);
    expect(error).toBeInstanceOf(ConvAiBadRequestException);
    expect(error).toEqual(
      new ConvAiBadRequestException(mockAiChatBadRequestError.message),
    );
  });
  it('Should return ConvAiUnauthorizedException of status code is 401', async () => {
    const error = wrapConvAiError(mockAiChatUnauthorizedError);
    expect(error).toBeInstanceOf(ConvAiUnauthorizedException);
    expect(error).toEqual(
      new ConvAiUnauthorizedException(mockAiChatUnauthorizedError.message),
    );
  });
  it('Should return ConvAiForbiddenException of status code is 403', async () => {
    const error = wrapConvAiError(mockAiChatAccessDeniedError);
    expect(error).toBeInstanceOf(ConvAiForbiddenException);
    expect(error).toEqual(
      new ConvAiForbiddenException(mockAiChatAccessDeniedError.message),
    );
  });
  it('Should return ConvAiNotFoundException of status code is 404', async () => {
    const error = wrapConvAiError(mockAiChatNotFoundError);
    expect(error).toBeInstanceOf(ConvAiNotFoundException);
    expect(error).toEqual(
      new ConvAiNotFoundException(mockAiChatNotFoundError.message),
    );
  });
  it('Should return ConvAiInternalServerErrorException of status code is 500', async () => {
    const error = wrapConvAiError(mockAiChatInternalServerError);
    expect(error).toBeInstanceOf(ConvAiInternalServerErrorException);
    expect(error).toEqual(
      new ConvAiInternalServerErrorException(
        mockAiChatInternalServerError.message,
      ),
    );
  });
  it('Should return ConvAiInternalServerErrorException by default', async () => {
    const errorMessage = 'Unreachable error';
    const mockAxiosError = {
      response: {
        status: 503,
        data: {
          message: errorMessage,
        },
      },
    } as AxiosError;

    const error = wrapConvAiError(mockAxiosError);
    expect(error).toBeInstanceOf(ConvAiInternalServerErrorException);
    expect(error).toEqual(new ConvAiInternalServerErrorException(errorMessage));
  });
  it('Should return ConvAiInternalServerErrorException if no response field', async () => {
    const errorMessage = 'some other error';
    const mockAxiosError = new Error(errorMessage) as AxiosError;

    const error = wrapConvAiError(mockAxiosError);
    expect(error).toBeInstanceOf(ConvAiInternalServerErrorException);
    expect(error).toEqual(new ConvAiInternalServerErrorException(errorMessage));
  });
  it('Should return HttpException if passed children of it', async () => {
    const mockAxiosError = new BadRequestException() as unknown as AxiosError;

    const error = wrapConvAiError(mockAxiosError);
    expect(error).toBeInstanceOf(BadRequestException);
    expect(error).toEqual(mockAxiosError);
  });
});
