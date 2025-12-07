import React, { Fragment } from 'react'

import JsonPretty from 'uiSrc/components/json-viewer/components/json-pretty'
import { IJsonArrayProps } from 'uiSrc/components/json-viewer/interfaces'

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
      <Fragment key={idx}>
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
