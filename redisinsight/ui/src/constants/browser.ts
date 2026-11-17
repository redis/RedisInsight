import { EuiComboBoxOptionOption } from '@elastic/eui'
import { TFunction } from 'i18next'
import { SortOrder } from './keys'

export const DEFAULT_DELIMITER: EuiComboBoxOptionOption = {
  label: ':',
  value: ':',
}
export const DEFAULT_TREE_SORTING = SortOrder.ASC
export const DEFAULT_SHOW_HIDDEN_RECOMMENDATIONS = false

export const getTextUnprintableCharacters = (t: TFunction) => ({
  title: t('browser.keyDetails.unprintable.title'),
  content: t('browser.keyDetails.unprintable.content'),
})

export const getTextInvalidValue = (t: TFunction) => ({
  title: t('browser.keyDetails.invalidValue.title'),
  text: t('browser.keyDetails.invalidValue.text'),
})

export const DATABASE_OVERVIEW_REFRESH_INTERVAL =
  riConfig.browser.databaseOverviewRefreshInterval
export const DATABASE_OVERVIEW_MINIMUM_REFRESH_INTERVAL =
  riConfig.browser.databaseOverviewMinimumRefreshInterval

export enum BrowserColumns {
  Size = 'size',
  TTL = 'ttl',
}

export const DEFAULT_SHOWN_COLUMNS = [BrowserColumns.Size, BrowserColumns.TTL]
