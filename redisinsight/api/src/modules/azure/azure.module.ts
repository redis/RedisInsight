import { Module } from '@nestjs/common';
import { AzureAuthService } from './auth/azure-auth.service';
import { AzureAuthController } from './auth/azure-auth.controller';
import { AzureAutodiscoveryService } from './autodiscovery/azure-autodiscovery.service';
import { AzureAutodiscoveryController } from './autodiscovery/azure-autodiscovery.controller';

@Module({
  providers: [AzureAuthService, AzureAutodiscoveryService],
  controllers: [AzureAuthController, AzureAutodiscoveryController],
  exports: [AzureAuthService],
})
export class AzureModule {}
