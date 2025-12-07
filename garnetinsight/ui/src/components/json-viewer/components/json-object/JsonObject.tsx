import React, { Fragment } from 'react'

import JsonPretty from 'uiSrc/components/json-viewer/components/json-pretty'
import { IJsonObjectProps } from 'uiSrc/components/json-viewer/interfaces'

const JsonObject = ({
  data,
  space = 2,
  gap = 0,
  lastElement = true,
}: IJsonObjectProps) => {
  const keys = Object.keys(data)

  return (
    <span data-testid="json-object-component">
      {'{'}
      {!!keys.length && '\n'}
      {keys.map((key, idx) => (
        <Fragment key={key}>
          {!!space && Array.from({ length: space + gap }, () => ' ')}
          <span className="json-pretty__key">{`"${key}"`}</span>
          {': '}
          <JsonPretty
            data={data[key]}
            lastElement={idx === keys.length - 1}
            space={space}
            gap={gap + space}
          />
        </Fragment>
      ))}
      {!!keys.length && !!gap && Array.from({ length: gap }, () => ' ')}
      {'}'}
      {!lastElement && ','}
      {'\n'}
    </span>
  )
}

export default JsonObject
