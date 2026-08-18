import { TFunction } from 'i18next'

export const getValidationErrors = (t: TFunction) => ({
  REQUIRED_TITLE: (count: number) =>
    t('validation.requiredFields.title', { count }),
  NO_DBS_SELECTED: t('validation.noDatabasesSelected'),
  SELECT_AT_LEAST_ONE: (text: string) =>
    t('validation.selectAtLeastOne', { text }),
  NO_PRIMARY_GROUPS_SENTINEL: t('validation.noPrimaryGroupsSelected'),
  NO_SUBSCRIPTIONS_CLOUD: t('validation.noSubscriptionsSelected'),
})
