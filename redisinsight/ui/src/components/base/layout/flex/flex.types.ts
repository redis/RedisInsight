import React, { HTMLAttributes, PropsWithChildren, ReactNode } from 'react'
import { CommonProps } from 'uiSrc/components/base/theme/types'
import {
  alignValues,
  columnCount,
  dirValues,
  flexItemStyles,
  gapSizes,
  justifyValues,
  VALID_GROW_VALUES,
} from './flex.constants'

export type GapSizeType = (typeof gapSizes)[number]
export type ColumnCountType = (typeof columnCount)[number]

export type GridProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  columns?: ColumnCountType
  className?: string
  gap?: GapSizeType
  centered?: boolean
  responsive?: boolean
}

export type FlexProps = PropsWithChildren &
  CommonProps &
  React.HTMLAttributes<HTMLDivElement> & {
    gap?: GapSizeType
    align?: (typeof alignValues)[number]
    direction?: (typeof dirValues)[number]
    justify?: (typeof justifyValues)[number]
    centered?: boolean
    responsive?: boolean
    wrap?: boolean
    grow?: boolean
    full?: boolean
  }

export type StyledFlexProps = Omit<
  FlexProps,
  | 'grow'
  | 'full'
  | 'gap'
  | 'align'
  | 'direction'
  | 'justify'
  | 'centered'
  | 'responsive'
  | 'wrap'
> & {
  $grow?: boolean
  $gap?: GapSizeType
  $align?: FlexProps['align']
  $direction?: FlexProps['direction']
  $justify?: FlexProps['justify']
  $centered?: boolean
  $responsive?: boolean
  $wrap?: boolean
  $full?: boolean
}

export type PaddingType =
  | keyof typeof flexItemStyles.padding
  | null
  | undefined
  | true
  | false

export type FlexItemProps = React.HTMLAttributes<HTMLDivElement> &
  PropsWithChildren &
  CommonProps & {
    grow?: (typeof VALID_GROW_VALUES)[number]
    $direction?: (typeof dirValues)[number]
    $padding?: PaddingType
    $gap?: GapSizeType
  }
