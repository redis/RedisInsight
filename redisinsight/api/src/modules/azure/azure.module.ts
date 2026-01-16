import { Global, Module } from '@nestjs/common';
import { AzureAuthService } from './auth/azure-auth.service';
import { AzureAuthController } from './auth/azure-auth.controller';
import { AzureAutodiscoveryService } from './autodiscovery/azure-autodiscovery.service';
import { AzureAutodiscoveryController } from './autodiscovery/azure-autodiscovery.controller';
import { AzureDatabaseTokenService } from './azure-database-token.service';
import { AzureTokenRefreshManager } from './azure-token-refresh.manager';

@Global()
@Module({
  providers: [
    AzureAuthService,
    AzureAutodiscoveryService,
    AzureDatabaseTokenService,
    AzureTokenRefreshManager,
  ],
  controllers: [AzureAuthController, AzureAutodiscoveryController],
  exports: [
    AzureAuthService,
    AzureAutodiscoveryService,
    AzureDatabaseTokenService,
    AzureTokenRefreshManager,
  ],
})
export class AzureModule {}
