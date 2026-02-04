import React from 'react'
import classNames from 'classnames'
import * as S from './flex.styles'
import type {
  FlexItemProps,
  FlexProps,
  GridProps,
  PaddingType,
} from './flex.types'
import { dirValues } from './flex.constants'

export const Grid = ({ children, className, ...rest }: GridProps) => {
  const classes = classNames('RI-flex-grid', className)
  return (
    <S.StyledGrid {...rest} className={classes}>
      {children}
    </S.StyledGrid>
  )
}

/**
 * Flex Group Component
 *
 * A flexbox container that can be used to lay out other flex items.
 * All properties are passed directly to the underlying `div`.
 *
 * @remarks
 * This is more or less direct reimplementation of `EuiFlexGroup`
 *
 * @example
 * <FlexGroup>
 *   <FlexItem grow={2}>
 *     Left
 *   </FlexItem>
 *   <FlexItem grow={3}>
 *     Right
 *   </FlexItem>
 * </FlexGroup>
 */
export const FlexGroup = ({
  children,
  className,
  grow,
  justify,
  gap,
  wrap,
  full,
  align,
  direction,
  responsive,
  centered,
  ...rest
}: FlexProps) => {
  const classes = classNames('RI-flex-group', className)
  return (
    <S.StyledFlex
      {...rest}
      className={classes}
      $grow={grow}
      $justify={justify}
      $gap={gap}
      $wrap={wrap}
      $full={full}
      $align={align}
      $direction={direction}
      $responsive={responsive}
      $centered={centered}
    >
      {children}
    </S.StyledFlex>
  )
}

/**
 * Column Component
 *
 * A Column component is a special type of FlexGroup that is meant to be used when you
 * want to lay out a group of items in a vertical column. It is functionally equivalent to
 * using a FlexGroup with a direction of 'column', but includes some additional conveniences.
 *
 * This is the preferred API of a component that is not meant to be distributed but widely used in our project
 *
 * @example
 * <Col>
 *   <FlexItem grow={2}>
 *     Top
 *   </FlexItem>
 *   <FlexItem grow={3}>
 *     Bottom
 *   </FlexItem>
 * </Col>
 */
export const Col = ({
  className,
  reverse,
  contentCentered,
  align,
  justify,
  ...rest
}: Omit<FlexProps, 'direction'> & {
  reverse?: boolean
  contentCentered?: boolean
}) => {
  const classes = classNames('RI-flex-col', className)
  return (
    <FlexGroup
      {...rest}
      align={contentCentered ? 'center' : align}
      justify={contentCentered ? 'center' : justify}
      className={classes}
      direction={reverse ? 'columnReverse' : 'column'}
    />
  )
}

export const Row = ({
  className,
  reverse,
  ...rest
}: Omit<FlexProps, 'direction'> & {
  reverse?: boolean
}) => {
  const classes = classNames('RI-flex-row', className)
  return (
    <FlexGroup
      {...rest}
      className={classes}
      direction={reverse ? 'rowReverse' : 'row'}
    />
  )
}

/**
 * Flex item component
 *
 * This represents a more or less direct implementation of `EuiFlexItem`
 *
 * @remarks
 * This component is useful when you want to create a flex item that can
 * grow or shrink based on the available space.
 *
 * @example
 * <FlexItem grow={2}>
 *   <div>Content</div>
 * </FlexItem>
 */
export const FlexItem = ({
  children,
  className,
  grow = false,
  padding,
  direction,
  ...rest
}: Omit<FlexItemProps, '$padding' | '$direction'> & {
  padding?: PaddingType
  direction?: (typeof dirValues)[number]
}) => {
  const classes = classNames('RI-flex-item', className)
  return (
    <S.StyledFlexItem
      {...rest}
      grow={grow}
      $padding={padding}
      $direction={direction}
      className={classes}
    >
      {children}
    </S.StyledFlexItem>
  )
}
