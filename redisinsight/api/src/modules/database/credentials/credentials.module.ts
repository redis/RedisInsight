import { DynamicModule, Global, Type } from '@nestjs/common';
import {
  CredentialStrategyProvider,
  ICredentialStrategy,
} from './credential-strategy.provider';
import { LocalCredentialStrategyProvider } from './local.credential-strategy.provider';
import { DefaultCredentialStrategy } from './strategies/default.credential-strategy';
import { AzureEntraIdCredentialStrategy } from './strategies/azure-entra-id.credential-strategy';

@Global()
export class CredentialsModule {
  static register(
    provider: Type<CredentialStrategyProvider> = LocalCredentialStrategyProvider,
    strategies: Type<ICredentialStrategy>[] = [
      AzureEntraIdCredentialStrategy,
      DefaultCredentialStrategy,
    ],
  ): DynamicModule {
    return {
      module: CredentialsModule,
      providers: [
        ...strategies,
        {
          provide: CredentialStrategyProvider,
          useClass: provider,
        },
      ],
      exports: [CredentialStrategyProvider],
    };
  }
}
