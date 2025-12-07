import React from 'react'
import { isString, isBoolean, isNull, isNumber } from 'lodash'
import { isBigInt } from 'uiSrc/components/json-viewer/utils'
import { IDefaultProps } from 'uiSrc/components/json-viewer/interfaces'

const JsonPrimitive = ({ data, lastElement = true }: IDefaultProps) => {
  let stringValue = data
  let valueStyle = 'json-pretty__other-value'

  if (isNull(data)) {
    stringValue = 'null'
    valueStyle = 'json-pretty__null-value'
  } else if (isString(data)) {
    stringValue = `"${data}"`
    valueStyle = 'json-pretty__string-value'
  } else if (isBoolean(data)) {
    stringValue = data ? 'true' : 'false'
    valueStyle = 'json-pretty__boolean-value'
  } else if (isNumber(data)) {
    stringValue = data.toString()
    valueStyle = 'json-pretty__number-value'
  } else if (isBigInt(data)) {
    stringValue = data.toString()
    valueStyle = 'json-pretty__bigint-value'
  } else {
    stringValue = data.toString()
  }
  return (
    <span data-testid="json-primitive-component">
      <span className={valueStyle} data-testid="json-primitive-value">
        {stringValue}
      </span>
      {!lastElement && ','}
      {'\n'}
    </span>
  )
}

export default JsonPrimitive
