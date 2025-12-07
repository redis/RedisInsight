import { EuiComboBoxOptionOption } from '@elastic/eui'
import { KeyValueFormat, SortOrder } from './keys'

export const DEFAULT_DELIMITER: EuiComboBoxOptionOption = {
  label: ':',
  value: ':',
}
export const DEFAULT_TREE_SORTING = SortOrder.ASC
export const DEFAULT_SHOW_HIDDEN_RECOMMENDATIONS = false

export const TEXT_UNPRINTABLE_CHARACTERS = {
  title: 'Non-printable characters have been detected',
  content: 'Use Workbench or CLI to edit without data loss.',
}
export const TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA =
  'This action is disabled because the key or value is too large to process within Garnet Insight.'
export const AXIOS_ERROR_DISABLED_ACTION_WITH_TRUNCATED_DATA = {
  response: {
    data: {
      message: TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA,
    },
  },
}
export const TEXT_CONSUMER_GROUP_NAME_TOO_LONG =
  'The consumer group name is too long, details cannot be displayed.'
export const TEXT_CONSUMER_NAME_TOO_LONG =
  'The consumer name is too long, details cannot be displayed.'
export const TEXT_DISABLED_FORMATTER_EDITING =
  'Cannot edit the value in this format'
export const TEXT_DISABLED_STRING_EDITING = 'Load the entire value to edit it'
export const TEXT_DISABLED_STRING_FORMATTING =
  'Load the entire value to select a format'

export const TEXT_INVALID_VALUE = {
  title: 'Value will be saved as Unicode',
  text: 'as it is not valid in the selected format.',
}

export const TEXT_DISABLED_COMPRESSED_VALUE: string =
  'Cannot edit the decompressed value'

export const TEXT_FAILED_CONVENT_FORMATTER = (format: KeyValueFormat) =>
  `Failed to convert to ${format}`

export const DATABASE_OVERVIEW_REFRESH_INTERVAL =
  riConfig.browser.databaseOverviewRefreshInterval
export const DATABASE_OVERVIEW_MINIMUM_REFRESH_INTERVAL =
  riConfig.browser.databaseOverviewMinimumRefreshInterval

export enum BrowserColumns {
  Size = 'size',
  TTL = 'ttl',
}

export const DEFAULT_SHOWN_COLUMNS = [BrowserColumns.Size, BrowserColumns.TTL]
