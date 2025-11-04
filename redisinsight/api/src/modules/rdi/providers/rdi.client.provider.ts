import { RdiClient } from 'src/modules/rdi/client/rdi.client';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { RdiClientMetadata } from 'src/modules/rdi/models';
import { RdiClientStorage } from 'src/modules/rdi/providers/rdi.client.storage';
import { RdiClientFactory } from 'src/modules/rdi/providers/rdi.client.factory';
import { RdiRepository } from 'src/modules/rdi/repository/rdi.repository';
import ERROR_MESSAGES from 'src/constants/error-messages';

@Injectable()
export class RdiClientProvider {
  private logger: Logger = new Logger('RdiClientProvider');

  constructor(
    private readonly repository: RdiRepository,
    private readonly rdiClientStorage: RdiClientStorage,
    private readonly rdiClientFactory: RdiClientFactory,
  ) {}

  async getOrCreate(rdiClientMetadata: RdiClientMetadata): Promise<RdiClient> {
    let client = await this.rdiClientStorage.getByMetadata(rdiClientMetadata);
    if (client) {
      await client.ensureAuth();
      this.updateLastConnection(rdiClientMetadata);
      return client;
    }

    client = await this.create(rdiClientMetadata);

    return this.rdiClientStorage.set(client);
  }

  async create(clientMetadata: RdiClientMetadata): Promise<RdiClient> {
    const rdi = await this.repository.get(clientMetadata.id);

    if (!rdi) {
      this.logger.error(
        `RDI with ${clientMetadata.id} was not Found`,
        clientMetadata,
      );
      throw new NotFoundException(ERROR_MESSAGES.INVALID_RDI_INSTANCE_ID);
    }
    const rdiClient = await this.rdiClientFactory.createClient(
      clientMetadata,
      rdi,
    );
    if (rdiClient) {
      this.updateLastConnection(clientMetadata);
    }
    return rdiClient;
  }

  async delete(rdiClientMetadata: RdiClientMetadata): Promise<number> {
    return this.rdiClientStorage.delete(rdiClientMetadata.id);
  }

  async deleteById(id: string): Promise<number> {
    return this.rdiClientStorage.delete(id);
  }

  async deleteManyByRdiId(id: string): Promise<number> {
    return this.rdiClientStorage.deleteManyByRdiId(id);
  }

  private async updateLastConnection(
    rdiClientMetadata: RdiClientMetadata,
  ): Promise<void> {
    try {
      await this.repository.update(rdiClientMetadata.id, {
        lastConnection: new Date(),
      });
    } catch (e) {
      // ignore the error
    }
  }
}
