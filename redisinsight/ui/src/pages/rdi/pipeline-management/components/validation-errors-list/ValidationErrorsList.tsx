import React from 'react'
import { Text } from 'uiSrc/components/base/text'

export interface Props {
  validationErrors: string[]
}

const ValidationErrorsList = (props: Props) => {
  const { validationErrors } = props

  return (
    <>
      {validationErrors?.length && (
        <Text>
          <ul>
            {validationErrors.map((err, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <li key={index}>{err}</li>
            ))}
          </ul>
        </Text>
      )}
    </>
  )
}

export default ValidationErrorsList
