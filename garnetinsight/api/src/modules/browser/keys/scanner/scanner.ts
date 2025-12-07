import { Injectable } from '@nestjs/common';
import { ClusterScannerStrategy } from 'src/modules/browser/keys/scanner/strategies/cluster.scanner.strategy';
import { StandaloneScannerStrategy } from 'src/modules/browser/keys/scanner/strategies/standalone.scanner.strategy';
import { ScannerStrategy } from 'src/modules/browser/keys/scanner/strategies/scanner.strategy';
import { RedisClientConnectionType } from 'src/modules/redis/client';

@Injectable()
export class Scanner {
  constructor(
    private readonly standaloneStrategy: StandaloneScannerStrategy,
    private readonly clusterStrategy: ClusterScannerStrategy,
  ) {}

  getStrategy(connectionType: RedisClientConnectionType): ScannerStrategy {
    switch (connectionType) {
      case RedisClientConnectionType.STANDALONE:
      case RedisClientConnectionType.SENTINEL:
        return this.standaloneStrategy;
      case RedisClientConnectionType.CLUSTER:
        return this.clusterStrategy;
      default:
        throw new Error(`Unsupported scan strategy: ${connectionType}`);
    }
  }
}
