import { ProviderDetails } from 'src/modules/database/models/provider-details';

/**
 * Subset of Database fields stored with Redis clients.
 */
export interface ClientDatabase {
  providerDetails?: ProviderDetails;
}
