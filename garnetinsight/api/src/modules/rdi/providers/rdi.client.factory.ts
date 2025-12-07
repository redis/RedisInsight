import { Injectable } from '@nestjs/common';
import { RdiClient } from 'src/modules/rdi/client/rdi.client';
import { Rdi, RdiClientMetadata } from 'src/modules/rdi/models';
import { ApiRdiClient } from 'src/modules/rdi/client/api.rdi.client';

@Injectable()
export class RdiClientFactory {
  async createClient(
    clientMetadata: RdiClientMetadata,
    rdi: Rdi,
  ): Promise<RdiClient> {
    const rdiClient = new ApiRdiClient(clientMetadata, rdi);
    await rdiClient.connect();

    return rdiClient;
  }
}
