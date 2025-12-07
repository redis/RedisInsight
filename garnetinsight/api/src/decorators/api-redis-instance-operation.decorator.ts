import { applyDecorators } from '@nestjs/common';
import { ApiRedisParams } from 'src/decorators/api-redis-params.decorator';
import {
  ApiEndpoint,
  IApiEndpointOptions,
} from 'src/decorators/api-endpoint.decorator';

export function ApiRedisInstanceOperation(
  options: IApiEndpointOptions,
): MethodDecorator & ClassDecorator {
  return applyDecorators(ApiRedisParams(), ApiEndpoint(options));
}
