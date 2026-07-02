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
    label: 'Key name*',
    placeholder: 'Enter key name',
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
    placeholder: 'Enter field',
  },
  fieldValue: {
    name: 'fieldValue',
    isRequire: false,
    label: 'Value',
    placeholder: 'Enter value',
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
    placeholder: 'Enter score*',
  },
  member: {
    name: 'member',
    isRequire: false,
    label: 'Member',
    placeholder: 'Enter member',
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
    placeholder: 'Enter member',
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
    placeholder: 'Enter value',
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
    placeholder: 'Enter element',
  },
  count: {
    name: 'count',
    isRequire: true,
    label: 'Count',
    placeholder: 'Enter count*',
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

interface IAddArrayFormConfig {
  startIndex: IFormField
  index: IFormField
  value: IFormField
}

export const AddArrayFormConfig: IAddArrayFormConfig = {
  startIndex: {
    name: 'startIndex',
    isRequire: true,
    label: 'Start index*',
    placeholder: 'Enter start index',
  },
  index: {
    name: 'index',
    isRequire: true,
    label: 'Index*',
    placeholder: 'Enter index',
  },
  value: {
    name: 'value',
    isRequire: true,
    label: 'Value*',
    placeholder: 'Enter value',
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
    placeholder: 'Enter entry ID',
  },
  name: {
    id: 'name',
    name: 'Field name',
    isRequire: false,
    label: 'Field',
    placeholder: 'Enter field',
  },
  value: {
    id: 'value',
    name: 'Field value',
    isRequire: false,
    label: 'Value',
    placeholder: 'Enter value',
  },
}
