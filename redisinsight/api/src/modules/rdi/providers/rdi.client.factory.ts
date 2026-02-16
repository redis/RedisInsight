import { Injectable, Logger } from '@nestjs/common';
import { RdiClient } from 'src/modules/rdi/client/rdi.client';
import { Rdi, RdiClientMetadata } from 'src/modules/rdi/models';
import { ApiRdiClient } from 'src/modules/rdi/client/api/v1/api.rdi.client';
import { ApiV2RdiClient } from 'src/modules/rdi/client/api/v2/api.v2.rdi.client';

@Injectable()
export class RdiClientFactory {
  private readonly logger = new Logger('RdiClientFactory');

  async createClient(
    clientMetadata: RdiClientMetadata,
    rdi: Rdi,
  ): Promise<RdiClient> {
    try {
      const rdiClientV2 = new ApiV2RdiClient(clientMetadata, rdi);
      // Probe v2 API endpoint to detect version
      const info = await rdiClientV2.getInfo();

      // todo: properly verify version from info to determine which client to use
      if (info) {
        await rdiClientV2.connect();
        await rdiClientV2.selectPipeline();
        return rdiClientV2;
      }
    } catch (error) {
      // v2 info endpoint is not available, falling back to v1 client
      this.logger.log('RDI API v2 not detected, falling back to v1 client');
    }

    const rdiClient = new ApiRdiClient(clientMetadata, rdi);
    await rdiClient.connect();
    return rdiClient;
  }
}
