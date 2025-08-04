import React, { ComponentProps } from 'react'

import { Input as RedisInput, TooltipProvider } from '@redis-ui/components'

export type RedisInputProps = ComponentProps<typeof RedisInput>

export default function TextInput(props: RedisInputProps) {
  // eslint-disable-next-line react/destructuring-assignment
  if (props.error) {
    return <TooltipProvider>
      <RedisInput {...props} />
    </TooltipProvider>
  }
  return <RedisInput {...props} />
} 