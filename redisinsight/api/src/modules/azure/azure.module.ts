import { Global, Module } from '@nestjs/common';
import { AzureAuthService } from './auth/azure-auth.service';
import { AzureAuthController } from './auth/azure-auth.controller';
import { AzureAuthAnalytics } from './auth/azure-auth.analytics';
import { AzureAutodiscoveryService } from './autodiscovery/azure-autodiscovery.service';
import { AzureAutodiscoveryController } from './autodiscovery/azure-autodiscovery.controller';
import { AzureAutodiscoveryAnalytics } from './autodiscovery/azure-autodiscovery.analytics';
import { DatabaseModule } from '../database/database.module';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [
    AzureAuthService,
    AzureAuthAnalytics,
    AzureAutodiscoveryService,
    AzureAutodiscoveryAnalytics,
  ],
  controllers: [AzureAuthController, AzureAutodiscoveryController],
  exports: [AzureAuthService, AzureAutodiscoveryService],
})
export class AzureModule {}
