import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { Database } from 'src/modules/database/models/database';
import {
  CredentialStrategy,
  CREDENTIAL_STRATEGY,
} from './credential-strategy.interface';

@Injectable()
export class CredentialResolver {
  private readonly logger = new Logger(CredentialResolver.name);

  constructor(
    @Optional()
    @Inject(CREDENTIAL_STRATEGY)
    private readonly strategies: CredentialStrategy[] = [],
  ) {
    if (!Array.isArray(this.strategies)) {
      this.strategies = this.strategies ? [this.strategies] : [];
    }

    this.logger.log(
      `Initialized with ${this.strategies.length} credential strategies`,
    );
  }

  async resolve(database: Database): Promise<Database> {
    for (const strategy of this.strategies) {
      if (strategy.canHandle(database)) {
        this.logger.debug(
          `Using ${strategy.constructor.name} for database ${database.id}`,
        );

        return strategy.resolve(database);
      }
    }

    return database;
  }
}
