import { get } from 'lodash';
import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { catchAclError } from 'src/utils';
import { IClusterInfo } from 'src/modules/cluster-monitor/strategies/cluster.info.interface';
import { ClusterNodesInfoStrategy } from 'src/modules/cluster-monitor/strategies/cluster-nodes.info.strategy';
import { ClusterShardsInfoStrategy } from 'src/modules/cluster-monitor/strategies/cluster-shards.info.strategy';
import { ClusterDetails } from 'src/modules/cluster-monitor/models';
import { ClientMetadata } from 'src/common/models';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { RedisClientConnectionType } from 'src/modules/redis/client';

export enum ClusterInfoStrategies {
  CLUSTER_NODES = 'CLUSTER_NODES',
  CLUSTER_SHARDS = 'CLUSTER_SHARDS',
}

@Injectable()
export class ClusterMonitorService {
  private logger = new Logger('ClusterMonitorService');

  private infoStrategies: Map<string, IClusterInfo> = new Map();

  constructor(private readonly databaseClientFactory: DatabaseClientFactory) {
    this.infoStrategies.set(
      ClusterInfoStrategies.CLUSTER_NODES,
      new ClusterNodesInfoStrategy(),
    );
    this.infoStrategies.set(
      ClusterInfoStrategies.CLUSTER_SHARDS,
      new ClusterShardsInfoStrategy(),
    );
  }

  /**
   * Get cluster details and details for all nodes
   * @param clientMetadata
   */
  public async getClusterDetails(
    clientMetadata: ClientMetadata,
  ): Promise<ClusterDetails> {
    try {
      const client =
        await this.databaseClientFactory.getOrCreateClient(clientMetadata);

      if (client.getConnectionType() !== RedisClientConnectionType.CLUSTER) {
        return Promise.reject(
          new BadRequestException('Current database is not in a cluster mode'),
        );
      }

      const info = await client.getInfo('server');

      const strategy = this.getClusterInfoStrategy(
        get(info, 'server.redis_version'),
      );

      return await strategy.getClusterDetails(client);
    } catch (e) {
      this.logger.error('Unable to get cluster details', e, clientMetadata);

      if (e instanceof HttpException) {
        throw e;
      }

      throw catchAclError(e);
    }
  }

  /**
   * Return strategy on how we are going to fetch topology and other cluster info
   * based on Redis version
   * @param version
   * @private
   */
  private getClusterInfoStrategy(version: string): IClusterInfo {
    const intVersion = parseInt(version, 10) || 0;
    if (intVersion >= 7) {
      return this.infoStrategies.get(ClusterInfoStrategies.CLUSTER_SHARDS);
    }

    return this.infoStrategies.get(ClusterInfoStrategies.CLUSTER_NODES);
  }
}
