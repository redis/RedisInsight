import { Module } from '@nestjs/common';
import { CredentialResolver } from './credential-resolver.service';
import { CREDENTIAL_STRATEGY } from './credential-strategy.interface';
import { AzureEntraIdCredentialStrategy } from './strategies/azure-entra-id.credential-strategy';

@Module({
  providers: [
    AzureEntraIdCredentialStrategy,
    {
      provide: CREDENTIAL_STRATEGY,
      useExisting: AzureEntraIdCredentialStrategy,
    },
    CredentialResolver,
  ],
  exports: [CredentialResolver],
})
export class CredentialsModule {}
