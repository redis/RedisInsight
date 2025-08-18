import React, { ComponentProps } from 'react'

import { PasswordInput as RedisPasswordInput } from '@redis-ui/components'

export type RedisPasswordInputProps = ComponentProps<typeof RedisPasswordInput>

export function RiPasswordInput(props: RedisPasswordInputProps) {
  return <RedisPasswordInput {...props} />
}
