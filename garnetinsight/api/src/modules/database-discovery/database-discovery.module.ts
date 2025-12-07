import { Module } from '@nestjs/common';
import { DatabaseDiscoveryService } from 'src/modules/database-discovery/database-discovery.service';
import { LocalDatabaseDiscoveryService } from 'src/modules/database-discovery/local.database-discovery.service';
import { AutoDatabaseDiscoveryService } from 'src/modules/database-discovery/auto.database-discovery.service';
import { PreSetupDatabaseDiscoveryService } from 'src/modules/database-discovery/pre-setup.database-discovery.service';

@Module({
  providers: [
    AutoDatabaseDiscoveryService,
    PreSetupDatabaseDiscoveryService,
    {
      provide: DatabaseDiscoveryService,
      useClass: LocalDatabaseDiscoveryService,
    },
  ],
  exports: [DatabaseDiscoveryService],
})
export class DatabaseDiscoveryModule {}
