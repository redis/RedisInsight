import React from 'react'
import { toNumber } from 'lodash'
import { MAX_TTL_NUMBER, Maybe, validateTTLNumberForAddKey } from 'uiSrc/utils'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { FormFieldset } from 'uiSrc/components/base/forms/fieldset'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { TextInput } from 'uiSrc/components/base/inputs'
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
      <Row className={styles.container} gap="m">
        <FlexItem grow>
          <FormFieldset
            legend={{ children: 'Select key type', display: 'hidden' }}
          >
            <FormField label="Key Type*">
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
            </FormField>
          </FormFieldset>
        </FlexItem>
        <FlexItem grow>
          <FormField label={config.keyTTL.label}>
            <TextInput
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
          </FormField>
        </FlexItem>
      </Row>
      <Spacer size="m" />
      <FormField label={config.keyName.label}>
        <TextInput
          name={config.keyName.name}
          id={config.keyName.name}
          value={keyName}
          placeholder={config.keyName.placeholder}
          onChange={stKeyName}
          disabled={loading}
          autoComplete="off"
          data-testid="key"
        />
      </FormField>
    </div>
  )
}

export default AddKeyCommonFields
