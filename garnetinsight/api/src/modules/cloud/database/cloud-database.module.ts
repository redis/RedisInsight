import { Module } from '@nestjs/common';
import { CloudDatabaseCapiProvider } from 'src/modules/cloud/database/cloud-database.capi.provider';
import { CloudDatabaseCapiService } from 'src/modules/cloud/database/cloud-database.capi.service';
import { CloudDatabaseAnalytics } from 'src/modules/cloud/database/cloud-database.analytics';

@Module({
  providers: [
    CloudDatabaseCapiProvider,
    CloudDatabaseCapiService,
    CloudDatabaseAnalytics,
  ],
  controllers: [],
  exports: [CloudDatabaseCapiService, CloudDatabaseAnalytics],
})
export class CloudDatabaseModule {}
