import i18n from 'uiSrc/i18n'
import {
  MAX_KEY_LENGTH,
  MAX_VALUE_LENGTH,
  VALID_TAG_KEY_REGEX,
  VALID_TAG_VALUE_REGEX,
  INVALID_FIELD_MESSAGE,
  INVALID_FIELD_UNIQUE_KEY_MESSAGE,
  INVALID_FIELD_MAX_KEY_LENGTH_MESSAGE,
  INVALID_FIELD_MAX_VALUE_LENGTH_MESSAGE,
} from './constants'

export function getInvalidTagErrors(
  tags: { key: string; value: string }[],
  index: number,
) {
  const tag = tags[index]

  let keyError: string | undefined
  let valueError: string | undefined

  if (tag?.key) {
    if (tag.key.length > MAX_KEY_LENGTH) {
      keyError = i18n.t(INVALID_FIELD_MAX_KEY_LENGTH_MESSAGE, {
        max: MAX_KEY_LENGTH,
      })
    } else if (!VALID_TAG_KEY_REGEX.test(tag.key)) {
      keyError = i18n.t(INVALID_FIELD_MESSAGE)
    } else if (tags.some((t, i) => i !== index && t.key === tag.key)) {
      keyError = i18n.t(INVALID_FIELD_UNIQUE_KEY_MESSAGE)
    }
  }

  if (tag?.value) {
    if (tag.value.length > MAX_VALUE_LENGTH) {
      valueError = i18n.t(INVALID_FIELD_MAX_VALUE_LENGTH_MESSAGE, {
        max: MAX_VALUE_LENGTH,
      })
    } else if (!VALID_TAG_VALUE_REGEX.test(tag.value)) {
      valueError = i18n.t(INVALID_FIELD_MESSAGE)
    }
  }

  return { keyError, valueError }
}
