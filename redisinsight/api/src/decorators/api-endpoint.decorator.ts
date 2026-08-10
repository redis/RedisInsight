import { applyDecorators, HttpCode } from '@nestjs/common';
import {
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiResponseOptions,
} from '@nestjs/swagger';
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
