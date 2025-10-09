import React, { ComponentProps } from 'react'

import { Input } from '@redis-ui/components'

export type ComposedInputProps = ComponentProps<typeof Input> & {
  before?: JSX.Element
  after?: JSX.Element
}

export default function ComposedInput(props: ComposedInputProps) {
  const { before, after, placeholder, ...inputProps } = props
  return (
    <Input.Compose {...inputProps}>
      {before}
      <Input.Tag placeholder={placeholder} />
      {after}
    </Input.Compose>
  )
}
