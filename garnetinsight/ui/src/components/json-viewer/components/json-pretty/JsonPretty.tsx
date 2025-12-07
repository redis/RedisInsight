import React from 'react'

import JsonPrimitive from 'uiSrc/components/json-viewer/components/json-primitive'
import JsonArray from 'uiSrc/components/json-viewer/components/json-array'
import JsonObject from 'uiSrc/components/json-viewer/components/json-object'
import { isArray, isObject } from 'uiSrc/components/json-viewer/utils'
import { IDefaultProps } from 'uiSrc/components/json-viewer/interfaces'

const JsonPretty = ({ data, ...props }: IDefaultProps) => {
  if (data?._isBigNumber) {
    return <JsonPrimitive data={data} {...props} />
  }

  if (isArray(data)) {
    return <JsonArray data={data} {...props} />
  }

  if (isObject(data)) {
    return <JsonObject data={data} {...props} />
  }

  return <JsonPrimitive data={data} {...props} />
}

export default JsonPretty
