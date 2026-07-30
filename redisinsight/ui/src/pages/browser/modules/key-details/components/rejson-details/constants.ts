import { ParseKeys } from 'i18next'

export const JSONErrors: Record<
  'keyCorrectSyntax' | 'valueJSONFormat',
  ParseKeys
> = {
  keyCorrectSyntax: 'browser.rejson.error.keyCorrectSyntax',
  valueJSONFormat: 'browser.rejson.error.valueJSONFormat',
}

export const MIN_LEFT_PADDING_NESTING = 1
export const MAX_LEFT_PADDING_NESTING = 8
