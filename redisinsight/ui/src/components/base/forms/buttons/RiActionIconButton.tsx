import React from 'react'
import { ActionIconButton as RedisUiActionIconButton } from '@redis-ui/components'

export type ButtonProps = React.ComponentProps<typeof RedisUiActionIconButton>

export const RiActionIconButton = (props: ButtonProps) => (
  <RedisUiActionIconButton {...props} />
)
