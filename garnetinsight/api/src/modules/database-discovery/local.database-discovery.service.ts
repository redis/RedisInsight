import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import config, { Config } from 'src/utils/config';
import { SessionMetadata } from 'src/common/models';
import { PreSetupDatabaseDiscoveryService } from 'src/modules/database-discovery/pre-setup.database-discovery.service';
import { AutoDatabaseDiscoveryService } from 'src/modules/database-discovery/auto.database-discovery.service';
import { DatabaseDiscoveryService } from 'src/modules/database-discovery/database-discovery.service';
import { SettingsService } from 'src/modules/settings/settings.service';

const SERVER_CONFIG = config.get('server') as Config['server'];

@Injectable()
export class LocalDatabaseDiscoveryService extends DatabaseDiscoveryService {
  private logger = new Logger('LocalDatabaseDiscoveryService');

  constructor(
    @Inject(forwardRef(() => SettingsService))
    private readonly settingsService: SettingsService,
    private readonly autoDatabaseDiscoveryService: AutoDatabaseDiscoveryService,
    private readonly preSetupDatabaseDiscoveryService: PreSetupDatabaseDiscoveryService,
  ) {
    super();
  }

  async discover(
    sessionMetadata: SessionMetadata,
    firstRun?: boolean,
  ): Promise<void> {
    try {
      // No need to auto discover for Redis Stack - quick check
      if (SERVER_CONFIG.buildType === 'REDIS_STACK') {
        return;
      }

      // check agreements to understand if it is first launch
      const settings =
        await this.settingsService.getAppSettings(sessionMetadata);

      if (!settings?.agreements?.eula) {
        return;
      }

      const { discovered } =
        await this.preSetupDatabaseDiscoveryService.discover(sessionMetadata);

      if (!discovered && firstRun) {
        await this.autoDatabaseDiscoveryService.discover(sessionMetadata);
      }
    } catch (e) {
      // ignore error
      this.logger.error('Unable to discover databases', e);
    }
  }
}
