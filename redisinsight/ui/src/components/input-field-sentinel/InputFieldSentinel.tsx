import React, { useState } from 'react'
import styled from 'styled-components'
import { omit } from 'lodash'

import { useDebouncedEffect } from 'uiSrc/services'
import {
  NumericInput,
  PasswordInput,
  TextInput,
} from 'uiSrc/components/base/inputs'

import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'

export enum SentinelInputFieldType {
  Text = 'text',
  Password = 'password',
  Number = 'number',
}

export interface Props {
  name?: string
  value?: string
  placeholder?: string
  inputType?: SentinelInputFieldType
  isText?: boolean
  isNumber?: boolean
  maxLength?: number
  min?: number
  max?: number
  isInvalid?: boolean
  disabled?: boolean
  className?: string
  append?: React.ReactElement
  onChangedInput: (name: string, value: string) => void
}
const InputInvalidIcon = styled(RiIcon).attrs({
  color: 'danger500',
  type: 'ToastDangerIcon',
})`
  position: absolute;
  top: calc(50% - 9px);
  right: 10px;
`

const InputFieldSentinel = (props: Props) => {
  const {
    name = '',
    value: valueProp = '',
    inputType = SentinelInputFieldType.Text,
    isInvalid: isInvalidProp = false,
    onChangedInput,
  } = props

  const clearProp = omit(props, 'inputType')

  const [value, setValue] = useState(valueProp)
  const [isInvalid, setIsInvalid] = useState(isInvalidProp)

  const handleChange = (value: string) => {
    setValue(value)
    isInvalid && setIsInvalid(false)
  }

  useDebouncedEffect(() => onChangedInput(name, value), 200, [value])

  return (
    <>
      {inputType === SentinelInputFieldType.Text && (
        <TextInput
          {...clearProp}
          value={value}
          onChange={handleChange}
          data-testid="sentinel-input"
        />
      )}
      {inputType === SentinelInputFieldType.Password && (
        <PasswordInput
          {...clearProp}
          value={value}
          onChange={(value) => handleChange(value)}
          data-testid="sentinel-input-password"
        />
      )}
      {inputType === SentinelInputFieldType.Number && (
        <NumericInput
          {...clearProp}
          autoValidate
          value={Number(value)}
          onChange={(value) => handleChange(value ? value.toString() : '')}
          data-testid="sentinel-input-number"
        />
      )}
      {isInvalid && <InputInvalidIcon />}
    </>
  )
}

export default InputFieldSentinel
