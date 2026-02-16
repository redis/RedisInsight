import { plainToInstance } from 'class-transformer';
import { RdiPipelineStatus } from 'src/modules/rdi/models';
import { GetStatusResponse } from 'src/modules/rdi/client/api/v1/responses';

export const transformStatus = (data: GetStatusResponse): RdiPipelineStatus => {
  return plainToInstance(RdiPipelineStatus, {
    status: data.pipelines?.default?.status,
    state: data.pipelines?.default?.state,
  });
};
