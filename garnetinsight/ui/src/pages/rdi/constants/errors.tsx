import { upperFirst } from 'lodash'
import React from 'react'

export const rdiErrorMessages = {
  invalidStructure: (
    name = 'Value',
    msg = 'Failed to convert YAML to JSON structure',
  ) => (
    <>
      {`${upperFirst(name)} has an invalid structure.`}
      <br />
      {msg}
    </>
  ),
}
