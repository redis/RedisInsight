import { Global, Module } from '@nestjs/common';
import { AzureAuthService } from './auth/azure-auth.service';
import { AzureAuthController } from './auth/azure-auth.controller';
import { AzureAutodiscoveryService } from './autodiscovery/azure-autodiscovery.service';
import { AzureAutodiscoveryController } from './autodiscovery/azure-autodiscovery.controller';
import { AzureTokenRefreshManager } from './azure-token-refresh.manager';

@Global()
@Module({
  providers: [
    AzureAuthService,
    AzureAutodiscoveryService,
    AzureTokenRefreshManager,
  ],
  controllers: [AzureAuthController, AzureAutodiscoveryController],
  exports: [AzureAuthService, AzureAutodiscoveryService, AzureTokenRefreshManager],
})
export class AzureModule {}
