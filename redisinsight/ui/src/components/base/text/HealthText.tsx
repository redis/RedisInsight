import React from 'react'
import { Typography } from '@redis-ui/components'
import cn from 'classnames'
import { Row } from 'uiSrc/components/base/layout/flex'
import { BodyProps, Indicator } from 'uiSrc/components/base/text/text.styles'

type ColorType = BodyProps['color'] | (string & {})
export type HealthProps = Omit<BodyProps, 'color'> & {
  color?: ColorType
}

export const HealthText = ({
  color,
  size = 'S',
  className,
  ...rest
}: HealthProps) => (
  <Row align="center" gap="m" justify="start">
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
  </Row>
)
