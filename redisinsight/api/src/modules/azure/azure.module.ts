import { Global, Module } from '@nestjs/common';
import { AzureAuthService } from './auth/azure-auth.service';
import { AzureAuthController } from './auth/azure-auth.controller';

@Global()
@Module({
  providers: [AzureAuthService],
  controllers: [AzureAuthController],
  exports: [AzureAuthService],
})
export class AzureModule {}
