import { Injectable } from '@nestjs/common';
import { RdiClient } from 'src/modules/rdi/client/rdi.client';
import { Rdi, RdiClientMetadata } from 'src/modules/rdi/models';
import { ApiRdiClient } from 'src/modules/rdi/client/api/v1/api.rdi.client';
import { ApiV2RdiClient } from 'src/modules/rdi/client/api/v2/api.v2.rdi.client';

@Injectable()
export class RdiClientFactory {
  async createClient(
    clientMetadata: RdiClientMetadata,
    rdi: Rdi,
  ): Promise<RdiClient> {
    let rdiClientV2 = new ApiV2RdiClient(clientMetadata, rdi);
    let info = null;

    try {
      info = await rdiClientV2.getInfo();
    } catch (error) {
      // info endpoint is not available
      // skip the error and continue without info
    }

    // todo: properly verify version from info to determine which client to use
    if (info) {
      await rdiClientV2.connect();
      await rdiClientV2.selectPipeline();
      return rdiClientV2;
    }

    const rdiClient = new ApiRdiClient(clientMetadata, rdi);
    await rdiClient.connect();
    return rdiClient;
  }
}
