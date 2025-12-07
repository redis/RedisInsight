import { API_PARAM_DATABASE_ID } from 'src/common/constants';
import { ClientContext } from 'src/common/models';
import { ClientMetadataParam } from 'src/common/decorators';

export const BrowserClientMetadata = (
  databaseIdParam = API_PARAM_DATABASE_ID,
) =>
  ClientMetadataParam({
    context: ClientContext.Browser,
    databaseIdParam,
  });
