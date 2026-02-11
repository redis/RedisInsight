import { pick } from 'lodash';
import { ProviderDetails } from 'src/modules/database/models/provider-details';

/**
 * Subset of Database fields stored with Redis clients.
 */
export interface ClientDatabase {
  providerDetails?: ProviderDetails;
}

const CLIENT_DATABASE_FIELDS: (keyof ClientDatabase)[] = ['providerDetails'];

export const createClientDatabase = (
  database: ClientDatabase,
): ClientDatabase => pick(database, CLIENT_DATABASE_FIELDS);
