import { BadRequestException, Logger, OnModuleDestroy } from '@nestjs/common';
import { sum } from 'lodash';

import { SessionMetadata } from 'src/common/models';

export const INCOMPLETE_CLIENT_METADATA_MESSAGE =
  'Client metadata missed required properties';

export interface PooledClientMetadata {
  id: string;
  sessionMetadata?: SessionMetadata;
}

/** What the pool needs from a client: identity plus idle bookkeeping. */
export interface PooledClient {
  id: string;
  metadata: PooledClientMetadata;
  isIdle(): boolean;
  setLastUsed(): void;
}

/**
 * In-memory pool of per-user API clients with a periodic idle sweep.
 * Shared by the feature modules that keep authenticated HTTP clients
 * alive between requests (RDI, Agent Memory); subclasses only provide
 * the pool-key derivation for their metadata type.
 */
export abstract class PooledClientStorage<
  TClient extends PooledClient,
  TMetadata extends PooledClientMetadata,
> implements OnModuleDestroy
{
  protected readonly logger: Logger;

  private readonly clients: Map<string, TClient> = new Map();

  private readonly syncInterval: NodeJS.Timeout;

  protected constructor(loggerContext: string, syncIntervalMs: number) {
    this.logger = new Logger(loggerContext);
    this.syncInterval = setInterval(
      this.syncClients.bind(this),
      syncIntervalMs,
    );
  }

  /** Build the pool key for the given client metadata */
  protected abstract generateId(metadata: TMetadata): string;

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

  async get(id: string): Promise<TClient | undefined> {
    const client = this.clients.get(id);
    if (client) {
      client.setLastUsed();
    }

    return client;
  }

  async getByMetadata(metadata: TMetadata): Promise<TClient | undefined> {
    this.validateMetadata(metadata);
    return this.get(this.generateId(metadata));
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
   * Finds clients created for the endpoint/instance with the given
   * metadata id and returns their pool keys.
   */
  protected findClientsByMetadataId(id: string): string[] {
    return [...this.clients.values()]
      .filter((client) => client.metadata.id === id)
      .map((client) => client.id);
  }

  /**
   * Removes all clients created for the endpoint/instance with the given
   * metadata id and returns the number of removed clients.
   */
  protected async deleteManyByMetadataId(id: string): Promise<number> {
    const toRemove = this.findClientsByMetadataId(id);

    this.logger.debug(`Trying to remove ${toRemove.length} clients`);

    return sum(await Promise.all(toRemove.map(this.delete.bind(this))));
  }

  /**
   * Saves client into the clients pool. When a client with such "id"
   * exists it is replaced with the new one.
   */
  async set(client: TClient): Promise<TClient> {
    if (!client.id) {
      throw new BadRequestException(INCOMPLETE_CLIENT_METADATA_MESSAGE);
    }
    this.validateMetadata(client.metadata);
    this.clients.set(client.id, client);
    return client;
  }

  private validateMetadata(metadata: PooledClientMetadata): void {
    if (
      !metadata?.id ||
      !metadata.sessionMetadata?.sessionId ||
      !metadata.sessionMetadata?.accountId ||
      !metadata.sessionMetadata.userId
    ) {
      throw new BadRequestException(INCOMPLETE_CLIENT_METADATA_MESSAGE);
    }
  }
}
