import { omit } from 'lodash'
import React, { useState } from 'react'
import cx from 'classnames'
import { useDebouncedEffect } from 'uiSrc/services'
import {
  RiNumericInput,
  RiPasswordInput,
  RiTextInput,
} from 'uiSrc/components/base/inputs'

import { RiIcon } from 'uiSrc/components/base/icons'
import styles from './styles.module.scss'

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
        <RiTextInput
          {...clearProp}
          value={value}
          onChange={handleChange}
          data-testid="sentinel-input"
        />
      )}
      {inputType === SentinelInputFieldType.Password && (
        <RiPasswordInput
          {...clearProp}
          value={value}
          onChange={(value) => handleChange(value)}
          data-testid="sentinel-input-password"
        />
      )}
      {inputType === SentinelInputFieldType.Number && (
        <RiNumericInput
          {...clearProp}
          autoValidate
          value={Number(value)}
          onChange={(value) => handleChange(value ? value.toString() : '')}
          data-testid="sentinel-input-number"
        />
      )}
      {isInvalid && (
        <RiIcon
          color="danger500"
          type="ToastDangerIcon"
          className={cx(styles.inputInvalidIcon)}
        />
      )}
    </>
  )
}

export default InputFieldSentinel
