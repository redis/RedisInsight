import { Database } from 'src/modules/database/models/database';

export interface CredentialStrategy {
  canHandle(database: Database): boolean;
  resolve(database: Database): Promise<Database>;
}

export const CREDENTIAL_STRATEGY = Symbol('CREDENTIAL_STRATEGY');
