import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { sessionMetadataFromRequest } from 'src/common/decorators';
import { plainToInstance } from 'class-transformer';
import { AgentMemoryClientMetadata } from 'src/modules/agent-memory/models';
import { Validator } from 'class-validator';
import { ApiParam } from '@nestjs/swagger';

const validator = new Validator();

export const RequestAgentMemoryClientMetadata = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    const metadata = plainToInstance(AgentMemoryClientMetadata, {
      id: req.params?.['id'],
      sessionMetadata: sessionMetadataFromRequest(req),
    });

    const errors = validator.validateSync(metadata, {
      whitelist: false, // allow additional fields if needed for flexibility
    });

    if (errors?.length) {
      throw new BadRequestException(
        Object.values(errors[0].constraints ?? { error: 'Bad request' }),
      );
    }

    return metadata;
  },
  [
    (target: object, key: string | symbol | undefined) => {
      if (key === undefined) return;
      const descriptor = Object.getOwnPropertyDescriptor(target, key);
      if (!descriptor) return;
      ApiParam({
        name: 'id',
        schema: { type: 'string' },
        required: true,
      })(target, key, descriptor);
    },
  ],
);
