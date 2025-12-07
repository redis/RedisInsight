import { API_PARAM_DATABASE_ID } from 'src/common/constants';
import { createParamDecorator } from '@nestjs/common';
import { ClientContext } from 'src/common/models';
import { clientMetadataParamFactory } from 'src/common/decorators';

export const WorkbenchClientMetadata = (
  databaseIdParam = API_PARAM_DATABASE_ID,
) =>
  createParamDecorator(clientMetadataParamFactory)({
    context: ClientContext.Workbench,
    databaseIdParam,
  });
