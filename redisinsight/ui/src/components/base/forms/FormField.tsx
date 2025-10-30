import React, { ComponentProps } from 'react'
import {
  FormField as RedisFormField,
  TooltipProvider,
} from '@redis-ui/components'
import { InfoIconProps } from '@redis-ui/components/dist/Label/components/InfoIcon/InfoIcon.types'

export type { InfoIconProps }

export type RedisFormFieldProps = ComponentProps<typeof RedisFormField> & {
  infoIconProps?: InfoIconProps
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
