import React, { ComponentProps, forwardRef } from 'react'

import { Input as RedisInput, TooltipProvider } from '@redis-ui/components'

export type RedisInputProps = ComponentProps<typeof RedisInput>

const TextInput = forwardRef<
  React.ElementRef<typeof RedisInput>,
  RedisInputProps
>((props, ref) => (
  <TooltipProvider>
    <RedisInput ref={ref} {...props} />
  </TooltipProvider>
))

export default TextInput
