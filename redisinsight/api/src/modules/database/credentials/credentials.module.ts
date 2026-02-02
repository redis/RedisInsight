import { DynamicModule, Global, Type } from '@nestjs/common';
import { CredentialStrategyProvider } from './credential-strategy.provider';
import { LocalCredentialStrategyProvider } from './local.credential-strategy.provider';
import { DefaultCredentialStrategy } from './strategies/default.credential-strategy';

@Global()
export class CredentialsModule {
  static register(
    provider: Type<CredentialStrategyProvider> = LocalCredentialStrategyProvider,
  ): DynamicModule {
    return {
      module: CredentialsModule,
      providers: [
        DefaultCredentialStrategy,
        {
          provide: CredentialStrategyProvider,
          useClass: provider,
        },
      ],
      exports: [CredentialStrategyProvider],
    };
  }
}
