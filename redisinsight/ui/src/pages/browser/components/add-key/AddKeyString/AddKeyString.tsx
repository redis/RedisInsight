import React, { FormEvent, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Maybe, stringToBuffer } from 'uiSrc/utils'

import { addKeyStateSelector, addStringKey } from 'uiSrc/slices/browser/keys'

import { ActionFooter } from 'uiSrc/pages/browser/components/action-footer'
import { RiFormField } from 'uiSrc/components/base/forms'
import { RiTextArea } from 'uiSrc/components/base/inputs'
import { SetStringWithExpireDto } from 'apiSrc/modules/browser/string/dto'
import { AddStringFormConfig as config } from '../constants/fields-config'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onCancel: (isCancelled?: boolean) => void
}

const AddKeyString = (props: Props) => {
  const { keyName = '', keyTTL, onCancel } = props
  const { loading } = useSelector(addKeyStateSelector)
  const [value, setValue] = useState<string>('')
  const [isFormValid, setIsFormValid] = useState<boolean>(false)

  const dispatch = useDispatch()

  useEffect(() => {
    setIsFormValid(keyName.length > 0)
  }, [keyName])

  const onFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (isFormValid) {
      submitData()
    }
  }

  const submitData = (): void => {
    const data: SetStringWithExpireDto = {
      keyName: stringToBuffer(keyName),
      value: stringToBuffer(value),
    }
    if (keyTTL !== undefined) {
      data.expire = keyTTL
    }
    dispatch(addStringKey(data, onCancel))
  }

  return (
    <form onSubmit={onFormSubmit}>
      <RiFormField label={config.value.label}>
        <RiTextArea
          name="value"
          id="value"
          placeholder={config.value.placeholder}
          value={value}
          onChange={setValue}
          disabled={loading}
          data-testid="string-value"
        />
      </RiFormField>
      <ActionFooter
        onCancel={() => onCancel(true)}
        onAction={submitData}
        actionText="Add Key"
        loading={loading}
        disabled={!isFormValid}
        actionTestId="add-key-string-btn"
      />
    </form>
  )
}

export default AddKeyString
