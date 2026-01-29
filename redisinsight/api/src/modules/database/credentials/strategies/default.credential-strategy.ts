import { Injectable } from '@nestjs/common';
import { Database } from 'src/modules/database/models/database';
import { ICredentialStrategy } from '../credential-strategy.provider';

/**
 * Default credential strategy that returns the database as-is.
 */
@Injectable()
export class DefaultCredentialStrategy implements ICredentialStrategy {
  canHandle(_database: Database): boolean {
    return true;
  }

  async resolve(database: Database): Promise<Database> {
    return database;
  }
}
