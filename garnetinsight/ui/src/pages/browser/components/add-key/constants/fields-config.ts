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

export const AddCommonFieldsFormConfig: IAddCommonFieldsFormConfig = {
  keyName: {
    name: 'keyName',
    isRequire: true,
    label: 'Key Name*',
    placeholder: 'Enter Key Name',
  },
  keyTTL: {
    name: 'keyTTL',
    isRequire: false,
    label: 'TTL',
    placeholder: 'No limit',
  },
}

interface IAddHashFormConfig {
  fieldName: IFormField
  fieldValue: IFormField
}

export const AddHashFormConfig: IAddHashFormConfig = {
  fieldName: {
    name: 'fieldName',
    isRequire: false,
    label: 'Field',
    placeholder: 'Enter Field',
  },
  fieldValue: {
    name: 'fieldValue',
    isRequire: false,
    label: 'Value',
    placeholder: 'Enter Value',
  },
}

interface IAddZsetFormConfig {
  score: IFormField
  member: IFormField
}

export const AddZsetFormConfig: IAddZsetFormConfig = {
  score: {
    name: 'score',
    isRequire: true,
    label: 'Score*',
    placeholder: 'Enter Score*',
  },
  member: {
    name: 'member',
    isRequire: false,
    label: 'Member',
    placeholder: 'Enter Member',
  },
}

interface IAddSetFormConfig {
  member: IFormField
}

export const AddSetFormConfig: IAddSetFormConfig = {
  member: {
    name: 'member',
    isRequire: false,
    label: 'Member',
    placeholder: 'Enter Member',
  },
}

interface IAddStringFormConfig {
  value: IFormField
}

export const AddStringFormConfig: IAddStringFormConfig = {
  value: {
    name: 'value',
    isRequire: false,
    label: 'Value',
    placeholder: 'Enter Value',
  },
}

interface IAddListFormConfig {
  element: IFormField
  count: IFormField
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
    placeholder: 'Enter Count*',
  },
}

interface IAddJSONFormConfig {
  value: IFormField
}

export const AddJSONFormConfig: IAddJSONFormConfig = {
  value: {
    name: 'value',
    isRequire: false,
    label: 'Value*',
    placeholder: 'Enter JSON',
  },
}

interface IAddStreamFormConfig {
  entryId: IFormField
  name: IFormField
  value: IFormField
}

export const AddStreamFormConfig: IAddStreamFormConfig = {
  entryId: {
    id: 'entryId',
    name: 'Entry ID',
    isRequire: true,
    label: 'Entry ID*',
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
