import { ClusterDetails } from 'src/modules/cluster-monitor/models';
import { RedisClient } from 'src/modules/redis/client';

export interface IClusterInfo {
  getClusterDetails(client: RedisClient): Promise<ClusterDetails>;
}
