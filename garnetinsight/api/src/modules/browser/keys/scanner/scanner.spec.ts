import { Test, TestingModule } from '@nestjs/testing';
import { Scanner } from 'src/modules/browser/keys/scanner/scanner';
import { mockSettingsService } from 'src/__mocks__';
import { SettingsService } from 'src/modules/settings/settings.service';
import { ConnectionType } from 'src/modules/database/entities/database.entity';
import { ClusterScannerStrategy } from 'src/modules/browser/keys/scanner/strategies/cluster.scanner.strategy';
import { StandaloneScannerStrategy } from 'src/modules/browser/keys/scanner/strategies/standalone.scanner.strategy';

describe('Scanner Manager', () => {
  let scanner;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Scanner,
        {
          provide: SettingsService,
          useFactory: mockSettingsService,
        },
        {
          provide: StandaloneScannerStrategy,
          useFactory: () => ConnectionType.STANDALONE,
        },
        {
          provide: ClusterScannerStrategy,
          useFactory: () => ConnectionType.CLUSTER,
        },
      ],
    }).compile();

    scanner = module.get<Scanner>(Scanner);
  });
  it('Should support Standalone strategy for standalone connection type', () => {
    expect(scanner.getStrategy(ConnectionType.STANDALONE)).toEqual(
      ConnectionType.STANDALONE,
    );
  });
  it('Should support Standalone strategy for sentinel connection type', () => {
    expect(scanner.getStrategy(ConnectionType.SENTINEL)).toEqual(
      ConnectionType.STANDALONE,
    );
  });
  it('Should support Cluster strategy for cluster connection type', () => {
    expect(scanner.getStrategy(ConnectionType.CLUSTER)).toEqual(
      ConnectionType.CLUSTER,
    );
  });
  it('Should throw error if no strategy', () => {
    try {
      scanner.getStrategy(ConnectionType.NOT_CONNECTED);
      fail();
    } catch (e) {
      expect(e.message).toEqual(
        `Unsupported scan strategy: ${ConnectionType.NOT_CONNECTED}`,
      );
    }
  });
});
