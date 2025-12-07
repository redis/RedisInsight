import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { sessionMetadataFromRequest } from 'src/common/decorators';
import { plainToInstance } from 'class-transformer';
import { RdiClientMetadata } from 'src/modules/rdi/models';
import { Validator } from 'class-validator';
import { ApiParam } from '@nestjs/swagger';

const validator = new Validator();

export const RequestRdiClientMetadata = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    const rdiClientMetadata = plainToInstance(RdiClientMetadata, {
      id: req.params?.['id'],
      sessionMetadata: sessionMetadataFromRequest(req),
    });

    const errors = validator.validateSync(rdiClientMetadata, {
      whitelist: false, // we need this to allow additional fields if needed for flexibility
    });

    if (errors?.length) {
      throw new BadRequestException(
        Object.values(errors[0].constraints) || 'Bad request',
      );
    }

    return rdiClientMetadata;
  },
  [
    (target: any, key: string) => {
      ApiParam({
        name: 'id',
        schema: { type: 'string' },
        required: true,
      })(target, key, Object.getOwnPropertyDescriptor(target, key));
    },
  ],
);
