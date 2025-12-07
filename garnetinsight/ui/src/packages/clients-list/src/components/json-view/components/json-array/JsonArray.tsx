import React, { Fragment } from 'react'

import { IJsonArrayProps } from '../../interfaces'
import JsonPretty from '../json-pretty'

const JsonArray = ({
  data,
  space = 2,
  gap = 0,
  lastElement = true,
}: IJsonArrayProps) => (
  <span data-testid="json-array-component">
    [{!!data.length && '\n'}
    {data.map((value, idx) => (
      // eslint-disable-next-line react/no-array-index-key
      <Fragment key={`${idx}`}>
        {!!space && Array.from({ length: space + gap }, () => ' ')}
        <JsonPretty
          data={value}
          lastElement={idx === data.length - 1}
          space={space}
          gap={gap + space}
        />
      </Fragment>
    ))}
    {!!data.length && !!gap && Array.from({ length: gap }, () => ' ')}]
    {!lastElement && ','}
    {'\n'}
  </span>
)

export default JsonArray
