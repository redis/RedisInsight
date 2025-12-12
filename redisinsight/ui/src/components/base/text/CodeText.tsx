import React, { ComponentProps } from 'react'
import cn from 'classnames'
import { Typography } from '@redis-ui/components'
import { StyledCodeText } from './text.styles'

export const CodeText = (props: ComponentProps<typeof Typography.Code>) => (
  <StyledCodeText {...props} className={cn(props.className, 'RI-code-text')} />
)
