import { Injectable } from '@nestjs/common';
import { Database } from 'src/modules/database/models/database';

export interface ICredentialStrategy {
  canHandle(database: Database): boolean;
  resolve(database: Database): Promise<Database>;
}

@Injectable()
export abstract class CredentialStrategyProvider {
  abstract resolve(database: Database): Promise<Database>;
}
