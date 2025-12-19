import React, { FormEvent, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toNumber } from 'lodash'
import {
  isVersionHigherOrEquals,
  Maybe,
  stringToBuffer,
  validateTTLNumberForAddKey,
} from 'uiSrc/utils'
import { addHashKey, addKeyStateSelector } from 'uiSrc/slices/browser/keys'
import AddMultipleFields from 'uiSrc/pages/browser/components/add-multiple-fields'

import { CommandsVersions } from 'uiSrc/constants/commandsVersions'
import { connectedInstanceOverviewSelector } from 'uiSrc/slices/instances/instances'
import { FeatureFlags } from 'uiSrc/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { ActionFooter } from 'uiSrc/pages/browser/components/action-footer'
import { TextInput } from 'uiSrc/components/base/inputs'
import {
  CreateHashWithExpireDto,
  HashFieldDto,
} from 'apiSrc/modules/browser/hash/dto'

import { IHashFieldState, INITIAL_HASH_FIELD_STATE } from './interfaces'
import { AddHashFormConfig as config } from '../constants/fields-config'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onCancel: (isCancelled?: boolean) => void
}

const AddKeyHash = (props: Props) => {
  const { keyName = '', keyTTL, onCancel } = props
  const { loading } = useSelector(addKeyStateSelector)
  const { version } = useSelector(connectedInstanceOverviewSelector)
  const { [FeatureFlags.hashFieldExpiration]: hashFieldExpirationFeature } =
    useSelector(appFeatureFlagsFeaturesSelector)

  const [fields, setFields] = useState<IHashFieldState[]>([
    { ...INITIAL_HASH_FIELD_STATE },
  ])
  const [isFormValid, setIsFormValid] = useState<boolean>(false)
  const lastAddedFieldName = useRef<HTMLInputElement>(null)
  const prevCountFields = useRef<number>(0)

  const isTTLAvailable =
    hashFieldExpirationFeature?.flag &&
    isVersionHigherOrEquals(version, CommandsVersions.HASH_TTL.since)

  const dispatch = useDispatch()

  useEffect(() => {
    setIsFormValid(`${keyName}`.length > 0)
  }, [keyName])

  useEffect(() => {
    if (
      prevCountFields.current !== 0 &&
      prevCountFields.current < fields.length
    ) {
      lastAddedFieldName.current?.focus()
    }
    prevCountFields.current = fields.length
  }, [fields.length])

  const addField = () => {
    const lastField = fields[fields.length - 1]
    const newState = [
      ...fields,
      {
        ...INITIAL_HASH_FIELD_STATE,
        id: lastField.id + 1,
      },
    ]
    setFields(newState)
  }

  const removeField = (id: number) => {
    const newState = fields.filter((item) => item.id !== id)
    setFields(newState)
  }

  const clearFieldsValues = (id: number) => {
    const newState = fields.map((item) =>
      item.id === id
        ? {
            ...item,
            fieldName: '',
            fieldValue: '',
            fieldTTL: undefined,
          }
        : item,
    )
    setFields(newState)
  }

  const onClickRemove = ({ id }: IHashFieldState) => {
    if (fields.length === 1) {
      clearFieldsValues(id)
      return
    }

    removeField(id)
  }

  const handleFieldChange = (formField: string, id: number, value: any) => {
    const newState = fields.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          [formField]: value,
        }
      }
      return item
    })
    setFields(newState)
  }

  const onFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (isFormValid) {
      submitData()
    }
  }

  const submitData = (): void => {
    const data: CreateHashWithExpireDto = {
      keyName: stringToBuffer(keyName),
      fields: fields.map((item) => {
        const defaultFields: HashFieldDto = {
          field: stringToBuffer(item.fieldName),
          value: stringToBuffer(item.fieldValue),
        }

        if (isTTLAvailable && item.fieldTTL) {
          defaultFields.expire = toNumber(item.fieldTTL)
        }

        return defaultFields
      }),
    }
    if (keyTTL !== undefined) {
      data.expire = keyTTL
    }
    dispatch(addHashKey(data, onCancel))
  }

  const isClearDisabled = (item: IHashFieldState): boolean =>
    fields.length === 1 &&
    !(item.fieldName.length || item.fieldValue.length || item.fieldTTL?.length)

  return (
    <form onSubmit={onFormSubmit}>
      <AddMultipleFields
        items={fields}
        isClearDisabled={isClearDisabled}
        onClickRemove={onClickRemove}
        onClickAdd={addField}
      >
        {(item, index) => (
          <Row align="center" gap="m">
            <FlexItem grow={2}>
              <FormField>
                <TextInput
                  name={`fieldName-${item.id}`}
                  id={`fieldName-${item.id}`}
                  placeholder={config.fieldName.placeholder}
                  value={item.fieldName}
                  disabled={loading}
                  onChange={(value) =>
                    handleFieldChange('fieldName', item.id, value)
                  }
                  ref={index === fields.length - 1 ? lastAddedFieldName : null}
                  data-testid="field-name"
                />
              </FormField>
            </FlexItem>
            <FlexItem grow={2}>
              <FormField>
                <TextInput
                  name={`fieldValue-${item.id}`}
                  id={`fieldValue-${item.id}`}
                  placeholder={config.fieldValue.placeholder}
                  value={item.fieldValue}
                  disabled={loading}
                  onChange={(value) =>
                    handleFieldChange('fieldValue', item.id, value)
                  }
                  data-testid="field-value"
                />
              </FormField>
            </FlexItem>
            {isTTLAvailable && (
              <FlexItem grow={1}>
                <FormField>
                  <TextInput
                    name={`fieldTTL-${item.id}`}
                    id={`fieldTTL-${item.id}`}
                    placeholder="Enter TTL"
                    value={item.fieldTTL || ''}
                    disabled={loading}
                    onChange={(value) =>
                      handleFieldChange(
                        'fieldTTL',
                        item.id,
                        validateTTLNumberForAddKey(value),
                      )
                    }
                    data-testid="hash-ttl"
                  />
                </FormField>
              </FlexItem>
            )}
          </Row>
        )}
      </AddMultipleFields>

      <ActionFooter
        onCancel={() => onCancel(true)}
        onAction={submitData}
        actionText="Add Key"
        loading={loading}
        disabled={!isFormValid}
        actionTestId="add-key-hash-btn"
      />
    </form>
  )
}

export default AddKeyHash
