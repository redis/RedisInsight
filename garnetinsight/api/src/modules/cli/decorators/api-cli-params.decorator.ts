import { applyDecorators } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';

export function ApiCLIParams(
  requireClientUuid: boolean = true,
): MethodDecorator & ClassDecorator {
  const decorators = [
    ApiParam({
      name: 'dbInstance',
      description: 'Database instance id.',
      type: String,
      required: true,
    }),
  ];
  if (requireClientUuid) {
    decorators.push(
      ApiParam({
        name: 'uuid',
        description: 'CLI client uuid',
        type: String,
        required: true,
      }),
    );
  }
  return applyDecorators(...decorators);
}
