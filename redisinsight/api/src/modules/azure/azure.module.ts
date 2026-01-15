import { Global, Module } from '@nestjs/common';
import { AzureAuthService } from './auth/azure-auth.service';
import { AzureAuthController } from './auth/azure-auth.controller';
import { AzureAutodiscoveryService } from './autodiscovery/azure-autodiscovery.service';
import { AzureAutodiscoveryController } from './autodiscovery/azure-autodiscovery.controller';
import { AzureDatabaseTokenService } from './azure-database-token.service';

@Global()
@Module({
  providers: [
    AzureAuthService,
    AzureAutodiscoveryService,
    AzureDatabaseTokenService,
  ],
  controllers: [AzureAuthController, AzureAutodiscoveryController],
  exports: [
    AzureAuthService,
    AzureAutodiscoveryService,
    AzureDatabaseTokenService,
  ],
})
export class AzureModule {}
