import { RdiClient } from 'src/modules/rdi/client/rdi.client';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { RdiClientMetadata } from 'src/modules/rdi/models';
import { sum } from 'lodash';
import { RDI_SYNC_INTERVAL } from 'src/modules/rdi/constants';

@Injectable()
export class RdiClientStorage {
  private readonly logger = new Logger('RdiClientStorage');

  private readonly clients: Map<string, RdiClient> = new Map();

  private readonly syncInterval: NodeJS.Timeout;

  constructor() {
    this.syncInterval = setInterval(
      this.syncClients.bind(this),
      RDI_SYNC_INTERVAL,
    );
  }

  onModuleDestroy() {
    clearInterval(this.syncInterval);
  }

  /**
   * Removes all clients with exceeded idle threshold
   * @private
   */
  private syncClients(): void {
    this.clients.forEach((client) => {
      if (client.isIdle()) {
        this.clients.delete(client.id);
      }
    });
  }

  async get(id: string): Promise<RdiClient> {
    const client = this.clients.get(id);
    if (client) {
      client.setLastUsed();
    }

    return client;
  }

  async getByMetadata(
    rdiClientMetadata: RdiClientMetadata,
  ): Promise<RdiClient> {
    if (
      !rdiClientMetadata.id ||
      !rdiClientMetadata.sessionMetadata?.sessionId ||
      !rdiClientMetadata.sessionMetadata?.accountId ||
      !rdiClientMetadata.sessionMetadata.userId
    ) {
      throw new BadRequestException(
        'Client metadata missed required properties',
      );
    }
    return this.get(RdiClient.generateId(rdiClientMetadata));
  }

  async delete(id: string): Promise<number> {
    const client = this.clients.get(id);

    if (client) {
      this.clients.delete(id);
      return 1;
    }

    return 0;
  }

  /**
   * Finds clients by rdi instance id and returns array of ids
   * @param id
   * @private
   */
  private findClientsById(id: string): string[] {
    return [...this.clients.values()]
      .filter((rdiClient) => rdiClient.metadata.id === id)
      .map((rdiClient) => rdiClient.id);
  }

  async deleteManyByRdiId(id: string): Promise<number> {
    const toRemove = this.findClientsById(id);

    this.logger.debug(`Trying to remove ${toRemove.length} clients`);

    return sum(await Promise.all(toRemove.map(this.delete.bind(this))));
  }

  /**
   * Saves client into the clients pool
   * When client with such "id" exists:
   * Will replace the current client with a new one
   * @param client
   */
  async set(client: RdiClient): Promise<RdiClient> {
    // Additional validation
    if (
      !client.id ||
      !client.metadata.sessionMetadata?.sessionId ||
      !client.metadata.sessionMetadata.userId ||
      !client.metadata.id
    ) {
      throw new BadRequestException(
        'Client metadata missed required properties',
      );
    }
    this.clients.set(client.id, client);
    return client;
  }
}
