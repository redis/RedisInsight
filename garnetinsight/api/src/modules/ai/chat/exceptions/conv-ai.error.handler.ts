import { AxiosError } from 'axios';
import { HttpException } from '@nestjs/common';
import {
  ConvAiBadRequestException,
  ConvAiForbiddenException,
  ConvAiInternalServerErrorException,
  ConvAiUnauthorizedException,
} from 'src/modules/ai/chat/exceptions';
import { ConvAiNotFoundException } from 'src/modules/ai/chat/exceptions/conv-ai.not-found.exception';

export const wrapConvAiError = (
  error: AxiosError,
  message?: string,
): HttpException => {
  if (error instanceof HttpException) {
    return error;
  }

  const { response } = error;
  let errorMessage = message || error?.message;

  if (!errorMessage) {
    const data = response?.data as any;
    errorMessage = data?.message;
  }

  if (response) {
    const errorOptions = { cause: new Error(response?.data as string) };
    switch (response?.status) {
      case 401:
        return new ConvAiUnauthorizedException(errorMessage, errorOptions);
      case 403:
        return new ConvAiForbiddenException(errorMessage, errorOptions);
      case 400:
        return new ConvAiBadRequestException(errorMessage, errorOptions);
      case 404:
        return new ConvAiNotFoundException(errorMessage, errorOptions);
      default:
        return new ConvAiInternalServerErrorException(
          errorMessage,
          errorOptions,
        );
    }
  }

  return new ConvAiInternalServerErrorException(errorMessage);
};
