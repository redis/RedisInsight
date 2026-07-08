import { FeatureFlags } from 'uiSrc/constants/featureFlags'
import { WhatsNewVersion, WhatsNewVersionType } from '../types'

export const version320: WhatsNewVersion = {
  version: '3.2.0',
  releaseDate: '2026-02-26',
  type: WhatsNewVersionType.Minor,
  cards: [
    {
      id: 'azure-managed-redis',
      title: 'Azure Managed Redis support',
      body: 'Connect to Azure Managed Redis with ease: auto-discover databases across subscriptions with one-click import, and sign in with Microsoft Entra ID (OAuth) including automatic token refresh and multi-account switching.',
      location: 'Database list — add a database via Azure auto-discovery',
      featureFlag: FeatureFlags.azureEntraId,
    },
  ],
}
