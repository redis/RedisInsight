import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { Database } from 'src/modules/database/models/database';
import { CredentialStrategy } from './credential-strategy.interface';
import { CREDENTIAL_STRATEGY } from './constants';

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

    this.logger.debug(
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

    this.logger.error(
      `No credential strategy found for database ${database.id}`,
    );

    throw new Error(
      `No credential strategy available to handle database ${database.id}`,
    );
  }
}
