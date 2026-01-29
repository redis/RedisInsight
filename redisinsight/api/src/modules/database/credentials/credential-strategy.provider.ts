import { Injectable } from '@nestjs/common';
import { Database } from 'src/modules/database/models/database';

export interface ICredentialStrategy {
  canHandle(database: Database): boolean;
  resolve(database: Database): Promise<Database>;
}

@Injectable()
export class CredentialStrategyProvider {
  private strategies: ICredentialStrategy[] = [];

  setStrategies(strategies: ICredentialStrategy[]): void {
    this.strategies = strategies;
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
