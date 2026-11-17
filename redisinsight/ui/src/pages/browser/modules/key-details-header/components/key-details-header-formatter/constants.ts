import { ParseKeys } from 'i18next'
import { KeyTypes, KeyValueFormat, ModulesKeyTypes } from 'uiSrc/constants'

// `text` holds an i18n key resolved with t() at render time.
export const KEY_VALUE_FORMATTER_OPTIONS: {
  text: ParseKeys
  value: KeyValueFormat
}[] = [
  {
    text: 'browser.keyDetails.formatter.unicode',
    value: KeyValueFormat.Unicode,
  },
  {
    text: 'browser.keyDetails.formatter.ascii',
    value: KeyValueFormat.ASCII,
  },
  {
    text: 'browser.keyDetails.formatter.binary',
    value: KeyValueFormat.Binary,
  },
  {
    text: 'browser.keyDetails.formatter.hex',
    value: KeyValueFormat.HEX,
  },
  {
    text: 'browser.keyDetails.formatter.json',
    value: KeyValueFormat.JSON,
  },
  {
    text: 'browser.keyDetails.formatter.markdown',
    value: KeyValueFormat.Markdown,
  },
  {
    text: 'browser.keyDetails.formatter.msgpack',
    value: KeyValueFormat.Msgpack,
  },
  {
    text: 'browser.keyDetails.formatter.pickle',
    value: KeyValueFormat.Pickle,
  },
  {
    text: 'browser.keyDetails.formatter.protobuf',
    value: KeyValueFormat.Protobuf,
  },
  {
    text: 'browser.keyDetails.formatter.php',
    value: KeyValueFormat.PHP,
  },
  {
    text: 'browser.keyDetails.formatter.java',
    value: KeyValueFormat.JAVA,
  },
  {
    text: 'browser.keyDetails.formatter.vector32',
    value: KeyValueFormat.Vector32Bit,
  },
  {
    text: 'browser.keyDetails.formatter.vector64',
    value: KeyValueFormat.Vector64Bit,
  },
  {
    text: 'browser.keyDetails.formatter.dateTime',
    value: KeyValueFormat.DateTime,
  },
]

export const KEY_VALUE_JSON_FORMATTER_OPTIONS = []

export const getKeyValueFormatterOptions = (
  viewFormat?: KeyTypes | ModulesKeyTypes,
) =>
  viewFormat !== KeyTypes.ReJSON
    ? [...KEY_VALUE_FORMATTER_OPTIONS]
    : [...KEY_VALUE_FORMATTER_OPTIONS].filter(
        (option) =>
          (KEY_VALUE_JSON_FORMATTER_OPTIONS as Array<any>).indexOf(
            option.value,
          ) !== -1,
      )
