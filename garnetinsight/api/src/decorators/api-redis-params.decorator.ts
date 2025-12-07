import { applyDecorators } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';

export function ApiRedisParams(): MethodDecorator & ClassDecorator {
  return applyDecorators(
    ApiParam({
      name: 'dbInstance',
      description: 'Database instance id.',
      type: String,
      required: true,
    }),
  );
}
