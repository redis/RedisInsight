import React from 'react'
import { Typography } from '@redis-ui/components'
import cn from 'classnames'
import { RiRow } from 'uiSrc/components/base/layout'
import { BodyProps, Indicator } from './text.styles'

type ColorType = BodyProps['color'] | (string & {})
export type HealthProps = Omit<BodyProps, 'color'> & {
  color?: ColorType
}

export const RiHealthText = ({
  color,
  size = 'S',
  className,
  ...rest
}: HealthProps) => (
  <RiRow align="center" gap="m" justify="start">
    <Indicator
      $color={color}
      className={cn(`color__${color}`, 'RI-health-indicator')}
    />
    <Typography.Body
      {...rest}
      component="div"
      size={size}
      className={cn(className, 'RI-health-text')}
    />
  </RiRow>
)
