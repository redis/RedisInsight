import { Module } from '@nestjs/common';
import { CredentialResolver } from './credential-resolver.service';
import { CREDENTIAL_STRATEGY } from './constants';
import { DefaultCredentialStrategy } from './strategies/default.credential-strategy';

@Module({
  providers: [
    DefaultCredentialStrategy,
    {
      provide: CREDENTIAL_STRATEGY,
      useExisting: DefaultCredentialStrategy,
    },
    CredentialResolver,
  ],
  exports: [CredentialResolver],
})
export class CredentialsModule {}
