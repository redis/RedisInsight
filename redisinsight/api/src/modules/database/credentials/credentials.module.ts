import { DynamicModule, Global } from '@nestjs/common';
import {
  CredentialStrategyProvider,
  ICredentialStrategy,
} from './credential-strategy.provider';
import { DefaultCredentialStrategy } from './strategies/default.credential-strategy';

/**
 * All credential strategies in order of priority.
 * First strategy that returns true from canHandle() will be used.
 * DefaultCredentialStrategy is always last as the fallback.
 */
const CREDENTIAL_STRATEGIES = [DefaultCredentialStrategy];

@Global()
export class CredentialsModule {
  static register(): DynamicModule {
    return {
      module: CredentialsModule,
      providers: [
        ...CREDENTIAL_STRATEGIES,
        {
          provide: CredentialStrategyProvider,
          useFactory: (...strategyInstances: ICredentialStrategy[]) => {
            const provider = new CredentialStrategyProvider();
            provider.setStrategies(strategyInstances);
            return provider;
          },
          inject: CREDENTIAL_STRATEGIES,
        },
      ],
      exports: [CredentialStrategyProvider],
    };
  }
}
