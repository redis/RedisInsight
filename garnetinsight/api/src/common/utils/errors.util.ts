import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { AxiosError } from 'axios';

export const wrapHttpError = (error: Error | AxiosError, message?: string) => {
  if (error instanceof HttpException) {
    return error;
  }

  const { response } = error as any;
  const errorMessage = error.message || message || response?.data?.message;
  const descriptionOrOptions =
    response?.data?.description || response?.data?.options;

  return new InternalServerErrorException(errorMessage, descriptionOrOptions);
};
