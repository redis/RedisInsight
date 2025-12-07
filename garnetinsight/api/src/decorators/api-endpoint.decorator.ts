import { applyDecorators, HttpCode } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import config, { Config } from 'src/utils/config';
import { BuildType } from 'src/modules/server/models/server';

const SERVER_CONFIG = config.get('server') as Config['server'];

export interface IApiEndpointOptions {
  description: string;
  statusCode?: number;
  responses?: ApiResponseOptions[];
  excludeFor?: BuildType[];
}

export function ApiEndpoint(
  options: IApiEndpointOptions,
): MethodDecorator & ClassDecorator {
  const { description, statusCode, responses = [], excludeFor = [] } = options;
  return applyDecorators(
    ApiOperation({ description }),
    ApiExcludeEndpoint(
      excludeFor.includes(SERVER_CONFIG.buildType as BuildType),
    ),
    HttpCode(statusCode),
    ...responses?.map((response) => ApiResponse(response)),
  );
}
