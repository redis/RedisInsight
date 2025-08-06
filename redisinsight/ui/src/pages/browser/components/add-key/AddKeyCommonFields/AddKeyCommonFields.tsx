import React from 'react'
import { toNumber } from 'lodash'

import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiFormField, RiFormFieldset, RiSelect } from 'uiBase/forms'
import { RiSpacer } from 'uiBase/layout/spacer'
import { RiTextInput } from 'uiBase/inputs'
import { MAX_TTL_NUMBER, Maybe, validateTTLNumberForAddKey } from 'uiSrc/utils'
import { AddCommonFieldsFormConfig as config } from '../constants/fields-config'

import styles from './styles.module.scss'

export interface Props {
  typeSelected: string
  onChangeType: (type: string) => void
  options: any
  loading: boolean
  keyName: string
  setKeyName: React.Dispatch<React.SetStateAction<string>>
  keyTTL: Maybe<number>
  setKeyTTL: React.Dispatch<React.SetStateAction<Maybe<number>>>
}

const AddKeyCommonFields = (props: Props) => {
  const {
    typeSelected,
    onChangeType = () => {},
    options,
    loading,
    keyName,
    setKeyName,
    keyTTL,
    setKeyTTL,
  } = props

  const handleTTLChange = (value: string) => {
    const validatedValue = validateTTLNumberForAddKey(value)
    if (validatedValue.toString().length) {
      setKeyTTL(toNumber(validatedValue))
    } else {
      setKeyTTL(undefined)
    }
  }

  return (
    <div className={styles.wrapper}>
      <RiRow className={styles.container} gap="m">
        <RiFlexItem grow>
          <RiFormFieldset
            legend={{ children: 'Select key type', display: 'hidden' }}
          >
            <RiFormField label="Key Type*">
              <RiSelect
                options={options}
                valueRender={({ option }): JSX.Element =>
                  (option.inputDisplay ?? option.value) as JSX.Element
                }
                value={typeSelected}
                onChange={(value: string) => onChangeType(value)}
                disabled={loading}
                data-testid="select-key-type"
              />
            </RiFormField>
          </RiFormFieldset>
        </RiFlexItem>
        <RiFlexItem grow>
          <RiFormField label={config.keyTTL.label}>
            <RiTextInput
              name={config.keyTTL.name}
              id={config.keyTTL.name}
              maxLength={200}
              min={0}
              max={MAX_TTL_NUMBER}
              placeholder={config.keyTTL.placeholder}
              value={`${keyTTL ?? ''}`}
              onChange={handleTTLChange}
              disabled={loading}
              autoComplete="off"
              data-testid="ttl"
            />
          </RiFormField>
        </RiFlexItem>
      </RiRow>
      <RiSpacer size="m" />
      <RiFormField label={config.keyName.label}>
        <RiTextInput
          name={config.keyName.name}
          id={config.keyName.name}
          value={keyName}
          placeholder={config.keyName.placeholder}
          onChange={setKeyName}
          disabled={loading}
          autoComplete="off"
          data-testid="key"
        />
      </RiFormField>
    </div>
  )
}

export default AddKeyCommonFields
