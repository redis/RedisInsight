import React, { ComponentProps, forwardRef } from 'react'

import { Input as RedisInput, TooltipProvider } from '@redis-ui/components'

export type RedisInputProps = ComponentProps<typeof RedisInput>

const TextInput = forwardRef<React.ElementRef<typeof RedisInput>, RedisInputProps>((props, ref) => {
  // eslint-disable-next-line react/destructuring-assignment
  if (props.error) {
    return (
      <TooltipProvider>
        <RedisInput ref={ref} {...props} />
      </TooltipProvider>
    )
  }
  return <RedisInput ref={ref} {...props} />
})

export default TextInput
