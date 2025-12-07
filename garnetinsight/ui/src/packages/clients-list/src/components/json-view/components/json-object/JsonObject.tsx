import React, { Fragment } from 'react'

import JsonPretty from '../json-pretty'
import { IJsonObjectProps } from '../../interfaces'

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
        <Fragment key={`${key}-{idx}`}>
          {!!space && Array.from({ length: space + gap }, () => ' ')}
          <span className="json-pretty__key">{`"${key}"`}</span>
          {': '}
          <JsonPretty
            data={data[key]}
            lastElement={idx === Object.keys(data).length - 1}
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
