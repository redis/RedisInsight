import React, { ComponentProps } from 'react'

import { Input as RedisInput } from '@redis-ui/components'

export type RedisInputProps = ComponentProps<typeof RedisInput>

export default function TextInput(props: RedisInputProps) {
  return <RedisInput {...props} />
} 