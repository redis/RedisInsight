import React from 'react'

import { IDefaultProps } from '../../interfaces'
import { isArray, isObject } from '../../utils'
import JsonPrimitive from '../json-primitive'
import JsonArray from '../json-array'
import JsonObject from '../json-object'

const JsonPretty = ({ data, ...props }: IDefaultProps) => {
  if (isArray(data)) {
    return <JsonArray data={data} {...props} />
  }

  if (isObject(data)) {
    return <JsonObject data={data} {...props} />
  }

  return <JsonPrimitive data={data} {...props} />
}

export default JsonPretty
