import { AxiosError } from 'axios';
import { HttpException } from '@nestjs/common';
import {
  RdiPipelineInternalServerErrorException,
  RdiPipelineUnauthorizedException,
  RdiPipelineNotFoundException,
  RdiPipelineValidationException,
} from 'src/modules/rdi/exceptions';
import { RdiPipelineForbiddenException } from './rdi-pipeline.forbidden.exception';
import { RdiPipelineBadRequestException } from "src/modules/rdi/exceptions/rdi-pipeline.bad-request.exception";

export const parseErrorMessage = (error: AxiosError<any>): string => {
  const data = error.response?.data;
  if (typeof data === 'string') {
    return data;
  }

  const detail = data?.detail;
  if (!detail) return error.message;

  if (typeof detail === 'string') return detail;

  return detail.message || detail.msg;
};

export const wrapRdiPipelineError = (error: AxiosError<any>): HttpException => {
  if (error instanceof HttpException) {
    return error;
  }

  const { response } = error;
  const message: string = parseErrorMessage(error);

  if (response) {
    const errorOptions = response?.data?.detail;
    switch (response?.status) {
      case 400:
        return new RdiPipelineBadRequestException(message, errorOptions);
      case 401:
        return new RdiPipelineUnauthorizedException(message, errorOptions);
      case 403:
        return new RdiPipelineForbiddenException(message, errorOptions);
      case 422:
        return new RdiPipelineValidationException(message, errorOptions);
      case 404:
        return new RdiPipelineNotFoundException(message, errorOptions);
      default:
        return new RdiPipelineInternalServerErrorException(message);
    }
  }

  return new RdiPipelineInternalServerErrorException(message);
};
