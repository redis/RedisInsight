export const presetTagSuggestions: {
  key: string
  value: string
}[] = [
  {
    key: 'environment',
    value: 'production',
  },
  {
    key: 'environment',
    value: 'staging',
  },
  {
    key: 'environment',
    value: 'qa',
  },
  {
    key: 'application',
    value: '',
  },
  {
    key: 'product',
    value: '',
  },
  {
    key: 'team',
    value: '',
  },
  {
    key: 'owner',
    value: '',
  },
]

export const MAX_KEY_LENGTH = 64
export const MAX_VALUE_LENGTH = 128

export const VALID_TAG_KEY_REGEX = new RegExp(
  `^[a-zA-Z0-9\\-_.@:+ ]{1,${MAX_KEY_LENGTH}}$`,
)
export const VALID_TAG_VALUE_REGEX = new RegExp(
  `^[a-zA-Z0-9\\-_.@:+ ]{1,${MAX_VALUE_LENGTH}}$`,
)

export const INVALID_FIELD_MESSAGE =
  'Tag can only have letters, numbers, spaces, and these special characters: “- _ . + @ :”'
export const INVALID_FIELD_UNIQUE_KEY_MESSAGE = 'Key should be unique'
export const INVALID_FIELD_MAX_KEY_LENGTH_MESSAGE = `Key must be under ${MAX_KEY_LENGTH} characters`
export const INVALID_FIELD_MAX_VALUE_LENGTH_MESSAGE = `Value must be under ${MAX_VALUE_LENGTH} characters`
