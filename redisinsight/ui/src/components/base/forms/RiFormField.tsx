import React, { ComponentProps } from 'react'
import {
  FormField as RedisFormField,
  TooltipProvider,
} from '@redis-ui/components'

export type RedisFormFieldProps = ComponentProps<typeof RedisFormField> & {
  infoIconProps?: any
}

export function RiFormField(props: RedisFormFieldProps) {
  // eslint-disable-next-line react/destructuring-assignment
  if (props.infoIconProps) {
    return (
      <TooltipProvider>
        <RedisFormField {...props} />
      </TooltipProvider>
    )
  }
  return <RedisFormField {...props} />
}
