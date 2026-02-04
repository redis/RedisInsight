import React, { HTMLAttributes } from 'react'
import { Typography } from '@redis-ui/components'
import { CommonProps } from 'uiSrc/components/base/theme/types'

export type BodyProps = React.ComponentProps<typeof Typography.Body>

export type EuiColorNames =
  | 'default'
  | 'subdued'
  | 'danger'
  | 'ghost'
  | 'accent'
  | 'warning'
  | 'success'

export type ColorType = BodyProps['color'] | EuiColorNames | (string & {})
export interface MapProps extends HTMLAttributes<HTMLElement> {
  $color?: ColorType
  $align?: 'left' | 'center' | 'right'
}
export type BodySizesLowerCaseType = 'm' | 's' | 'xs'
export type TextSizeType = BodyProps['size'] | BodySizesLowerCaseType

export type ColorTextProps = Omit<BodyProps, 'color' | 'size' | 'component'> & {
  color?: ColorType
  size?: TextSizeType
  component?: 'div' | 'span'
}

export type TextProps = Omit<BodyProps, 'color' | 'size'> &
  CommonProps & {
    color?: ColorType
    size?: TextSizeType
    textAlign?: 'left' | 'center' | 'right'
  }

export type TitleProps = React.ComponentProps<typeof Typography.Heading> & {}
export type TitleSize = TitleProps['size']
