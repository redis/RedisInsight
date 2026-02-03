import { Injectable } from '@nestjs/common';
import { Database } from 'src/modules/database/models/database';
import {
  CredentialStrategyProvider,
  ICredentialStrategy,
} from './credential-strategy.provider';
import { DefaultCredentialStrategy } from './strategies/default.credential-strategy';
import { AzureEntraIdCredentialStrategy } from './strategies/azure-entra-id.credential-strategy';

@Injectable()
export class LocalCredentialStrategyProvider extends CredentialStrategyProvider {
  private strategies: ICredentialStrategy[];

  constructor(
    private readonly azureEntraIdCredentialStrategy: AzureEntraIdCredentialStrategy,
    private readonly defaultCredentialStrategy: DefaultCredentialStrategy,
  ) {
    super();
    // Order matters: first match wins. DefaultCredentialStrategy is always last as fallback.
    this.strategies = [
      this.azureEntraIdCredentialStrategy,
      this.defaultCredentialStrategy,
    ];
  }

  getStrategy(database: Database): ICredentialStrategy | undefined {
    return this.strategies.find((strategy) => strategy.canHandle(database));
  }

  async resolve(database: Database): Promise<Database> {
    const strategy = this.getStrategy(database);
    if (!strategy) {
      throw new Error(
        `No credential strategy available to handle database ${database.id}`,
      );
    }
    return strategy.resolve(database);
  }
}
