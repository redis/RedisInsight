import { stringToBuffer } from 'uiSrc/utils/formatters/bufferFormatters'

export const MOCK_TRUNCATED_STRING_VALUE =
  '[Truncated due to length] some value...'
export const MOCK_TRUNCATED_BUFFER_VALUE = stringToBuffer(
  MOCK_TRUNCATED_STRING_VALUE,
)
