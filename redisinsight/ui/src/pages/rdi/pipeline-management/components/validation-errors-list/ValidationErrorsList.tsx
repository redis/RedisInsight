import React from 'react'

export interface Props {
  validationErrors: string[]
}

const ValidationErrorsList = (props: Props) => {
  const { validationErrors } = props

  if(!validationErrors?.length) {
    return null
  }

  return  (
    <ul>
      {validationErrors.map((err, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <li key={index}>{err}</li>
      ))}
    </ul>
  )
}

export default ValidationErrorsList
