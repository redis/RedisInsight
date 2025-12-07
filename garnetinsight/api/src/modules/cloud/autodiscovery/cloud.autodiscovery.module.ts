import { Module } from '@nestjs/common';
import { CloudAutodiscoveryController } from 'src/modules/cloud/autodiscovery/cloud.autodiscovery.controller';
import { CloudAutodiscoveryService } from 'src/modules/cloud/autodiscovery/cloud-autodiscovery.service';
import { CloudAutodiscoveryAnalytics } from 'src/modules/cloud/autodiscovery/cloud-autodiscovery.analytics';
import { CloudDatabaseModule } from 'src/modules/cloud/database/cloud-database.module';
import { CloudSubscriptionModule } from 'src/modules/cloud/subscription/cloud-subscription.module';
import { CloudUserModule } from 'src/modules/cloud/user/cloud-user.module';
import { MeCloudAutodiscoveryController } from 'src/modules/cloud/autodiscovery/me.cloud.autodiscovery.controller';
import { MeCloudAutodiscoveryService } from 'src/modules/cloud/autodiscovery/me.cloud-autodiscovery.service';
import { CloudCapiKeyModule } from 'src/modules/cloud/capi-key/cloud-capi-key.module';

@Module({
  imports: [
    CloudDatabaseModule,
    CloudSubscriptionModule,
    CloudUserModule,
    CloudCapiKeyModule,
  ],
  controllers: [CloudAutodiscoveryController, MeCloudAutodiscoveryController],
  providers: [
    CloudAutodiscoveryService,
    MeCloudAutodiscoveryService,
    CloudAutodiscoveryAnalytics,
  ],
})
export class CloudAutodiscoveryModule {}
