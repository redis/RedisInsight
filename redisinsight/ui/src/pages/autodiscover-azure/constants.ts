/**
 * Azure subscription state descriptions.
 * @see https://learn.microsoft.com/en-us/rest/api/resources/subscriptions/list#subscriptionstate
 */
export const AZURE_SUBSCRIPTION_STATE_DESCRIPTIONS: Record<string, string> = {
  Enabled: 'Subscription is active and fully functional.',
  Warned:
    'Subscription has payment issues but is still operational during a grace period.',
  PastDue: 'Payment is overdue. Services may be limited.',
  Disabled:
    'Subscription is suspended. Resources are not accessible until the subscription is re-enabled.',
  Deleted: 'Subscription has been deleted and cannot be recovered.',
}

/**
 * Azure database provisioning state descriptions.
 * @see https://learn.microsoft.com/en-us/rest/api/redis/redis/get#provisioningstate
 */
export const AZURE_PROVISIONING_STATE_DESCRIPTIONS: Record<string, string> = {
  Succeeded: 'Database is fully provisioned and ready to use.',
  Creating: 'Database is being created and is not yet available.',
  Updating: 'Database configuration is being updated.',
  Deleting: 'Database is being deleted.',
  Failed: 'Provisioning failed. The database is not usable.',
  Linking: 'Database is being linked for geo-replication.',
  Unlinking: 'Database is being unlinked from geo-replication.',
  Recovering: 'Database is recovering from a failure.',
  Provisioning: 'Database is being provisioned.',
  Scaling: 'Database is being scaled.',
  ConfiguringAAD: 'Entra ID (Azure AD) authentication is being configured.',
  Importing: 'Data is being imported into the database.',
  Exporting: 'Data is being exported from the database.',
}
