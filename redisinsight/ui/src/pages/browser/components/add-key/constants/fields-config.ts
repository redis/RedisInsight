import { TFunction } from 'i18next'

interface IFormField {
  id?: string
  name: string
  isRequire: boolean
  label: string
  placeholder: string
}

export interface IAddCommonFieldsFormConfig {
  keyName: IFormField
  keyTTL: IFormField
}

export const getAddCommonFieldsFormConfig = (
  t: TFunction,
): IAddCommonFieldsFormConfig => ({
  keyName: {
    name: 'keyName',
    isRequire: true,
    label: t('browser.addKey.form.keyName.label'),
    placeholder: t('browser.addKey.form.keyName.placeholder'),
  },
  keyTTL: {
    name: 'keyTTL',
    isRequire: false,
    label: t('browser.addKey.form.keyTTL.label'),
    placeholder: t('browser.addKey.form.keyTTL.placeholder'),
  },
})

interface IAddHashFormConfig {
  fieldName: IFormField
  fieldValue: IFormField
}

export const getAddHashFormConfig = (t: TFunction): IAddHashFormConfig => ({
  fieldName: {
    name: 'fieldName',
    isRequire: false,
    label: t('browser.addKey.form.field.label'),
    placeholder: t('browser.addKey.form.field.placeholder'),
  },
  fieldValue: {
    name: 'fieldValue',
    isRequire: false,
    label: t('browser.addKey.form.value.label'),
    placeholder: t('browser.addKey.form.value.placeholder'),
  },
})

interface IAddZsetFormConfig {
  score: IFormField
  member: IFormField
}

export const getAddZsetFormConfig = (t: TFunction): IAddZsetFormConfig => ({
  score: {
    name: 'score',
    isRequire: true,
    label: t('browser.addKey.form.score.label'),
    placeholder: t('browser.addKey.form.score.placeholder'),
  },
  member: {
    name: 'member',
    isRequire: false,
    label: t('browser.addKey.form.member.label'),
    placeholder: t('browser.addKey.form.member.placeholder'),
  },
})

interface IAddSetFormConfig {
  member: IFormField
}

export const getAddSetFormConfig = (t: TFunction): IAddSetFormConfig => ({
  member: {
    name: 'member',
    isRequire: false,
    label: t('browser.addKey.form.member.label'),
    placeholder: t('browser.addKey.form.member.placeholder'),
  },
})

interface IAddStringFormConfig {
  value: IFormField
}

export const getAddStringFormConfig = (t: TFunction): IAddStringFormConfig => ({
  value: {
    name: 'value',
    isRequire: false,
    label: t('browser.addKey.form.value.label'),
    placeholder: t('browser.addKey.form.value.placeholder'),
  },
})

interface IAddListFormConfig {
  element: IFormField
  count: IFormField
}

export const getAddListFormConfig = (t: TFunction): IAddListFormConfig => ({
  element: {
    name: 'element',
    isRequire: false,
    label: t('browser.addKey.form.element.label'),
    placeholder: t('browser.addKey.form.element.placeholder'),
  },
  count: {
    name: 'count',
    isRequire: true,
    label: t('browser.addKey.form.count.label'),
    placeholder: t('browser.addKey.form.count.placeholder'),
  },
})

interface IAddJSONFormConfig {
  value: IFormField
}

export const getAddJSONFormConfig = (t: TFunction): IAddJSONFormConfig => ({
  value: {
    name: 'value',
    isRequire: true,
    label: t('browser.addKey.form.value.label'),
    placeholder: t('browser.addKey.form.json.placeholder'),
  },
})

interface IAddArrayFormConfig {
  startIndex: IFormField
  index: IFormField
  value: IFormField
}

export const getAddArrayFormConfig = (t: TFunction): IAddArrayFormConfig => ({
  startIndex: {
    name: 'startIndex',
    isRequire: true,
    label: t('browser.addKey.form.startIndex.label'),
    placeholder: t('browser.addKey.form.startIndex.placeholder'),
  },
  index: {
    name: 'index',
    isRequire: true,
    label: t('browser.addKey.form.index.label'),
    placeholder: t('browser.addKey.form.index.placeholder'),
  },
  value: {
    name: 'value',
    isRequire: true,
    label: t('browser.addKey.form.value.label'),
    placeholder: t('browser.addKey.form.value.placeholder'),
  },
})

interface IAddStreamFormConfig {
  entryId: IFormField
  name: IFormField
  value: IFormField
}

// ponytail: legacy English configs kept for the key-details add/remove forms
// (list/set/zset/stream/string) and KeyDetailsHeaderName that still consume the
// static objects. Delete these once those areas migrate to the get*FormConfig(t)
// factories above (RI-8274 sub-areas C/D).
export const AddCommonFieldsFormConfig: IAddCommonFieldsFormConfig = {
  keyName: {
    name: 'keyName',
    isRequire: true,
    label: 'Key Name',
    placeholder: 'Enter Key Name',
  },
  keyTTL: {
    name: 'keyTTL',
    isRequire: false,
    label: 'TTL',
    placeholder: 'No limit',
  },
}

export const AddZsetFormConfig: IAddZsetFormConfig = {
  score: {
    name: 'score',
    isRequire: true,
    label: 'Score',
    placeholder: 'Enter Score',
  },
  member: {
    name: 'member',
    isRequire: false,
    label: 'Member',
    placeholder: 'Enter Member',
  },
}

export const AddStringFormConfig: IAddStringFormConfig = {
  value: {
    name: 'value',
    isRequire: false,
    label: 'Value',
    placeholder: 'Enter Value',
  },
}

export const AddListFormConfig: IAddListFormConfig = {
  element: {
    name: 'element',
    isRequire: false,
    label: 'Element',
    placeholder: 'Enter Element',
  },
  count: {
    name: 'count',
    isRequire: true,
    label: 'Count',
    placeholder: 'Enter Count',
  },
}

export const AddStreamFormConfig: IAddStreamFormConfig = {
  entryId: {
    id: 'entryId',
    name: 'Entry ID',
    isRequire: true,
    label: 'Entry ID',
    placeholder: 'Enter Entry ID',
  },
  name: {
    id: 'name',
    name: 'Field Name',
    isRequire: false,
    label: 'Field',
    placeholder: 'Enter Field',
  },
  value: {
    id: 'value',
    name: 'Field Value',
    isRequire: false,
    label: 'Value',
    placeholder: 'Enter Value',
  },
}
