import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Validator } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CloudCapiAuthDto } from 'src/modules/cloud/common/dto';

const validator = new Validator();

export const cloudAuthDtoFromRequestHeadersFactory = (
  data: unknown,
  ctx: ExecutionContext,
): CloudCapiAuthDto => {
  const request = ctx.switchToHttp().getRequest();

  const dto = plainToInstance(CloudCapiAuthDto, {
    capiKey: request.headers['x-cloud-api-key'],
    capiSecret: request.headers['x-cloud-api-secret'],
  });

  const errors = validator.validateSync(dto);

  if (errors?.length) {
    throw new UnauthorizedException(
      'Required authentication credentials were not provided',
    );
  }

  return dto;
};

export const CloudAuthHeaders = createParamDecorator(
  cloudAuthDtoFromRequestHeadersFactory,
);
