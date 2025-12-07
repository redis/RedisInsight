import {
  API_PARAM_CLI_CLIENT_ID,
  API_PARAM_DATABASE_ID,
} from 'src/common/constants';
import { createParamDecorator } from '@nestjs/common';
import { ClientContext } from 'src/common/models';
import { clientMetadataParamFactory } from 'src/common/decorators';

export const CliClientMetadata = (
  databaseIdParam = API_PARAM_DATABASE_ID,
  uniqueIdParam = API_PARAM_CLI_CLIENT_ID,
) =>
  createParamDecorator(clientMetadataParamFactory)({
    context: ClientContext.CLI,
    databaseIdParam,
    uniqueIdParam,
  });
