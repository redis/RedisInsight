import { Injectable } from '@nestjs/common';

import { PooledClientStorage } from 'src/common/client-storage/pooled-client.storage';
import { RdiClient } from 'src/modules/rdi/client/rdi.client';
import { RdiClientMetadata } from 'src/modules/rdi/models';
import { RDI_SYNC_INTERVAL } from 'src/modules/rdi/constants';

@Injectable()
export class RdiClientStorage extends PooledClientStorage<
  RdiClient,
  RdiClientMetadata
> {
  constructor() {
    super(RdiClientStorage.name, RDI_SYNC_INTERVAL);
  }

  protected generateId(metadata: RdiClientMetadata): string {
    return RdiClient.generateId(metadata);
  }

  async deleteManyByRdiId(id: string): Promise<number> {
    return this.deleteManyByMetadataId(id);
  }
}
