import { TFunction } from 'i18next'

export interface StateDescription {
  label: string
  description: string
}

/**
 * Azure subscription state descriptions.
 * @see https://learn.microsoft.com/en-us/rest/api/resources/subscriptions/list#subscriptionstate
 */
export const getAzureSubscriptionStateDescriptions = (
  t: TFunction,
): StateDescription[] => [
  {
    label: t('autodiscover.azure.subscriptionState.enabled.label'),
    description: t('autodiscover.azure.subscriptionState.enabled.description'),
  },
  {
    label: t('autodiscover.azure.subscriptionState.warned.label'),
    description: t('autodiscover.azure.subscriptionState.warned.description'),
  },
  {
    label: t('autodiscover.azure.subscriptionState.pastDue.label'),
    description: t('autodiscover.azure.subscriptionState.pastDue.description'),
  },
  {
    label: t('autodiscover.azure.subscriptionState.disabled.label'),
    description: t('autodiscover.azure.subscriptionState.disabled.description'),
  },
  {
    label: t('autodiscover.azure.subscriptionState.deleted.label'),
    description: t('autodiscover.azure.subscriptionState.deleted.description'),
  },
]

/**
 * Azure database type descriptions.
 * @see https://learn.microsoft.com/en-us/azure/azure-cache-for-redis/cache-overview
 */
export const getAzureDatabaseTypeDescriptions = (
  t: TFunction,
): StateDescription[] => [
  {
    label: t('autodiscover.azure.databaseType.standard.label'),
    description: t('autodiscover.azure.databaseType.standard.description'),
  },
  {
    label: t('autodiscover.azure.databaseType.enterprise.label'),
    description: t('autodiscover.azure.databaseType.enterprise.description'),
  },
]

/**
 * Azure database provisioning state descriptions.
 * @see https://learn.microsoft.com/en-us/rest/api/redis/redis/get#provisioningstate
 */
export const getAzureProvisioningStateDescriptions = (
  t: TFunction,
): StateDescription[] => [
  {
    label: t('autodiscover.azure.provisioningState.succeeded.label'),
    description: t(
      'autodiscover.azure.provisioningState.succeeded.description',
    ),
  },
  {
    label: t('autodiscover.azure.provisioningState.creating.label'),
    description: t('autodiscover.azure.provisioningState.creating.description'),
  },
  {
    label: t('autodiscover.azure.provisioningState.updating.label'),
    description: t('autodiscover.azure.provisioningState.updating.description'),
  },
  {
    label: t('autodiscover.azure.provisioningState.deleting.label'),
    description: t('autodiscover.azure.provisioningState.deleting.description'),
  },
  {
    label: t('autodiscover.azure.provisioningState.failed.label'),
    description: t('autodiscover.azure.provisioningState.failed.description'),
  },
  {
    label: t('autodiscover.azure.provisioningState.linking.label'),
    description: t('autodiscover.azure.provisioningState.linking.description'),
  },
  {
    label: t('autodiscover.azure.provisioningState.unlinking.label'),
    description: t(
      'autodiscover.azure.provisioningState.unlinking.description',
    ),
  },
  {
    label: t('autodiscover.azure.provisioningState.recovering.label'),
    description: t(
      'autodiscover.azure.provisioningState.recovering.description',
    ),
  },
  {
    label: t('autodiscover.azure.provisioningState.provisioning.label'),
    description: t(
      'autodiscover.azure.provisioningState.provisioning.description',
    ),
  },
  {
    label: t('autodiscover.azure.provisioningState.scaling.label'),
    description: t('autodiscover.azure.provisioningState.scaling.description'),
  },
  {
    label: t('autodiscover.azure.provisioningState.configuringAad.label'),
    description: t(
      'autodiscover.azure.provisioningState.configuringAad.description',
    ),
  },
  {
    label: t('autodiscover.azure.provisioningState.importing.label'),
    description: t(
      'autodiscover.azure.provisioningState.importing.description',
    ),
  },
  {
    label: t('autodiscover.azure.provisioningState.exporting.label'),
    description: t(
      'autodiscover.azure.provisioningState.exporting.description',
    ),
  },
]
