import React from 'react'
import classNames from 'classnames'
import {
  dirValues,
  FlexItemProps,
  FlexProps,
  GridProps,
  StyledFlex,
  StyledFlexItem,
  StyledGrid,
  VALID_PADDING_VALUES,
} from './flex.styles'

export const RiGrid = ({ children, className, ...rest }: GridProps) => {
  const classes = classNames('RI-flex-grid', className)
  return (
    <StyledGrid {...rest} className={classes}>
      {children}
    </StyledGrid>
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
export const RiFlexGroup = ({
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
    <StyledFlex
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
    </StyledFlex>
  )
}

/**
 * Column Component
 *
 * A Column component is a special type of FlexGroup that is meant to be used when you
 * want to layout a group of items in a vertical column. It is functionally equivalent to
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
export const RiCol = ({
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
    <RiFlexGroup
      {...rest}
      align={contentCentered ? 'center' : align}
      justify={contentCentered ? 'center' : justify}
      className={classes}
      direction={reverse ? 'columnReverse' : 'column'}
    />
  )
}

export const RiRow = ({
  className,
  reverse,
  ...rest
}: Omit<FlexProps, 'direction'> & {
  reverse?: boolean
}) => {
  const classes = classNames('RI-flex-row', className)
  return (
    <RiFlexGroup
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
export const RiFlexItem = ({
  children,
  className,
  grow = false,
  padding,
  direction,
  ...rest
}: Omit<FlexItemProps, '$padding' | '$direction'> & {
  padding?: (typeof VALID_PADDING_VALUES)[number]
  direction?: (typeof dirValues)[number]
}) => {
  const classes = classNames('RI-flex-item', className)
  return (
    <StyledFlexItem
      {...rest}
      grow={grow}
      $padding={padding}
      $direction={direction}
      className={classes}
    >
      {children}
    </StyledFlexItem>
  )
}
