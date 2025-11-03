import React, { ComponentProps } from 'react'
import {
  FormField as RedisFormField,
  TooltipProvider,
  LabelProps,
} from '@redis-ui/components'

export type RiInfoIconProps = LabelProps['infoIconProps']

export type RedisFormFieldProps = ComponentProps<typeof RedisFormField> & {
  infoIconProps?: RiInfoIconProps
}

export function FormField(props: RedisFormFieldProps) {
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
