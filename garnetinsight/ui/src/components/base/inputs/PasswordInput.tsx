import React, { ComponentProps } from 'react'

import { PasswordInput as RedisPasswordInput } from '@redis-ui/components'

export type RedisPasswordInputProps = ComponentProps<typeof RedisPasswordInput>

export default function PasswordInput(props: RedisPasswordInputProps) {
  return <RedisPasswordInput showExposureToggle="never" {...props} />
}
