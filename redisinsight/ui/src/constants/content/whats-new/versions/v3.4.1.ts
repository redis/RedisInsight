import { FeatureFlags } from 'uiSrc/constants/featureFlags'
import { WhatsNewVersion, WhatsNewVersionType } from '../types'

export const version341: WhatsNewVersion = {
  version: '3.4.1',
  releaseDate: '2026-04-20',
  type: WhatsNewVersionType.Minor,
  cards: [
    {
      id: 'search-workspace',
      title: 'Dedicated Search workspace',
      body: 'A new Search workspace with full index lifecycle support: create indexes from sample or existing data, query indexed data with an assisted editor, and save queries to a Query Library for reuse.',
      location: 'Search workspace in the main database navigation',
    },
    {
      id: 'azure-integration-enhancements',
      title: 'Azure integration enhancements',
      body: 'Entra ID authentication in Docker, Access Key authentication, and manual connection configuration for Azure Redis databases.',
      location: 'Database list — add an Azure database',
      featureFlag: FeatureFlags.azureEntraId,
    },
    {
      id: 'browser-column-sorting',
      tag: 'Improved',
      title: 'Sortable Browser key list',
      body: 'Sort the key list client-side by Key name, TTL, or Size directly from the column headers.',
      location: 'Browser — key list column headers',
    },
  ],
}
