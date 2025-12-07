import { HttpException } from '@nestjs/common';
import { CloudJobUnexpectedErrorException } from 'src/modules/cloud/job/exceptions/cloud-job-unexpected-error.exception';

export const wrapCloudJobError = (error: Error, message?: string) => {
  if (error instanceof HttpException) {
    return error;
  }

  if (error instanceof Error) {
    return new CloudJobUnexpectedErrorException(error.message || message, {
      cause: error,
    });
  }

  return new CloudJobUnexpectedErrorException(message);
};
