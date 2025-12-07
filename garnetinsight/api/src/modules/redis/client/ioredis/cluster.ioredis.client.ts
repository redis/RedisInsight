import { Cluster } from 'ioredis';
import {
  RedisClient,
  RedisClientConnectionType,
  IoredisClient,
  StandaloneIoredisClient,
  RedisClientNodeRole,
} from 'src/modules/redis/client';
import { findKey } from 'lodash';

enum IoredisNodeRole {
  PRIMARY = 'master',
  SECONDARY = 'slave',
  ALL = 'all',
}

export class ClusterIoredisClient extends IoredisClient {
  protected readonly client: Cluster;

  getConnectionType(): RedisClientConnectionType {
    return RedisClientConnectionType.CLUSTER;
  }

  async nodes(role?: RedisClientNodeRole): Promise<RedisClient[]> {
    return this.client
      .nodes(role ? IoredisNodeRole[role] : IoredisNodeRole.ALL)
      .map((node) => {
        let natAddress = {};

        if (this.client.options.natMap) {
          const natAddressString = findKey(this.client.options.natMap, {
            host: node.options.host,
            port: node.options.port,
          });

          if (natAddressString) {
            const [, natHost, natPort] = natAddressString.match(/(.+):(\d+)$/);
            natAddress = {
              natHost,
              natPort: +natPort,
            };
          }
        }

        return new StandaloneIoredisClient(this.clientMetadata, node, {
          host: node.options.host,
          port: node.options.port,
          ...natAddress,
        });
      });
  }
}
