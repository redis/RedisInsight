import React, { HTMLAttributes, PropsWithChildren, ReactNode } from 'react'

import styled, { css } from 'styled-components'
import { CommonProps, Theme } from 'uiSrc/components/base/theme/types'

export const gapSizes = ['none', 'xs', 's', 'm', 'l', 'xl', 'xxl'] as const
export type GapSizeType = (typeof gapSizes)[number]
export const columnCount = [1, 2, 3, 4] as const
export type ColumnCountType = (typeof columnCount)[number]

export type GridProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  columns?: ColumnCountType
  className?: string
  gap?: GapSizeType
  centered?: boolean
  responsive?: boolean
}

const flexGridStyles = {
  columns: {
    1: 'repeat(1, max-content)',
    2: 'repeat(2, max-content)',
    3: 'repeat(3, max-content)',
    4: 'repeat(4, max-content)',
  },
  responsive: css`
    @media screen and (max-width: 767px) {
      grid-template-columns: repeat(1, 1fr);
      grid-auto-flow: row;
    }
  `,
  centered: css`
    place-content: center;
  `,
}

export const StyledGrid = styled.div<GridProps>`
  display: grid;
  grid-template-columns: ${({ columns = 1 }) =>
    flexGridStyles.columns[columns] ?? flexGridStyles.columns['1']};
  gap: ${({ gap = 'none' }) => flexGroupStyles.gapSizes[gap] ?? '0'};
  ${({ centered = false }) => (centered ? flexGroupStyles.centered : '')}
  ${({ responsive = false }) => (responsive ? flexGridStyles.responsive : '')}
`

export const alignValues = [
  'center',
  'stretch',
  'baseline',
  'start',
  'end',
] as const
export const justifyValues = [
  'center',
  'start',
  'end',
  'between',
  'around',
  'evenly',
] as const
export const dirValues = [
  'row',
  'rowReverse',
  'column',
  'columnReverse',
] as const

const flexGroupStyles = {
  wrap: css`
    flex-wrap: wrap;
  `,
  centered: css`
    justify-content: center;
    align-items: center;
  `,
  gapSizes: {
    none: css``,
    xs: css`
      ${({ theme }: { theme: Theme }) => theme.core.space.space025};
    `,
    s: css`
      ${({ theme }: { theme: Theme }) => theme.core.space.space050};
    `,
    m: css`
      ${({ theme }: { theme: Theme }) => theme.core.space.space100};
    `,
    l: css`
      ${({ theme }: { theme: Theme }) => theme.core.space.space150};
    `,
    xl: css`
      ${({ theme }: { theme: Theme }) => theme.core.space.space250};
    `,
    xxl: css`
      ${({ theme }: { theme: Theme }) => theme.core.space.space300};
    `,
  },
  justify: {
    center: 'center',
    start: 'flex-start',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
    evenly: 'space-evenly',
  },
  align: {
    center: 'center',
    stretch: 'stretch',
    baseline: 'baseline',
    start: 'flex-start',
    end: 'flex-end',
  },
  direction: {
    row: 'row',
    rowReverse: 'row-reverse',
    column: 'column',
    columnReverse: 'column-reverse',
  },
  responsive: css`
    @media screen and (max-width: 767px) {
      flex-wrap: wrap;
    }
  `,
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

type StyledFlexProps = Omit<
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
export const StyledFlex = styled.div<StyledFlexProps>`
  display: flex;
  flex-grow: ${({ $grow = true }) => ($grow ? 1 : 0)};
  gap: ${({ $gap = 'none' }) => flexGroupStyles.gapSizes[$gap] ?? '0'};
  align-items: ${({ $align = 'stretch' }) =>
    flexGroupStyles.align[$align] ?? 'stretch'};
  flex-direction: ${({ $direction = 'row' }) =>
    flexGroupStyles.direction[$direction] ?? 'row'};
  justify-content: ${({ $justify = 'start' }) =>
    flexGroupStyles.justify[$justify] ?? 'flex-start'};
  ${({ $centered = false }) => ($centered ? flexGroupStyles.centered : '')}
  ${({ $responsive = false }) =>
    $responsive ? flexGroupStyles.responsive : ''}
  ${({ $wrap = false }) => ($wrap ? flexGroupStyles.wrap : '')}
  ${({ $full = false, $direction = 'row' }) =>
    $full
      ? $direction === 'row' || $direction === 'rowReverse'
        ? 'width: 100%' // if it is row make it full width
        : 'height: 100%;' // else, make it full height
      : ''}
`
export const flexItemStyles = {
  growZero: css`
    flex-grow: 0;
    flex-basis: auto;
  `,
  grow: css`
    flex-basis: 0;
  `,
  growSizes: {
    '1': css`
      flex-grow: 1;
    `,
    '2': css`
      flex-grow: 2;
    `,
    '3': css`
      flex-grow: 3;
    `,
    '4': css`
      flex-grow: 4;
    `,
    '5': css`
      flex-grow: 5;
    `,
    '6': css`
      flex-grow: 6;
    `,
    '7': css`
      flex-grow: 7;
    `,
    '8': css`
      flex-grow: 8;
    `,
    '9': css`
      flex-grow: 9;
    `,
    '10': css`
      flex-grow: 10;
    `,
  },
  padding: {
    '0': css`
      padding: ${({ theme }: { theme: Theme }) => theme.core.space.space000};
    `,
    '1': css`
      padding: ${({ theme }: { theme: Theme }) => theme.core.space.space010};
    `,
    '2': css`
      padding: ${({ theme }: { theme: Theme }) => theme.core.space.space025};
    `,
    '3': css`
      padding: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
    `,
    '4': css`
      padding: ${({ theme }: { theme: Theme }) => theme.core.space.space100};
    `,
    '5': css`
      padding: ${({ theme }: { theme: Theme }) => theme.core.space.space150};
    `,
    '6': css`
      padding: ${({ theme }: { theme: Theme }) => theme.core.space.space200};
    `,
    '7': css`
      padding: ${({ theme }: { theme: Theme }) => theme.core.space.space250};
    `,
    '8': css`
      padding: ${({ theme }: { theme: Theme }) => theme.core.space.space300};
    `,
    '9': css`
      padding: ${({ theme }: { theme: Theme }) => theme.core.space.space400};
    `,
    '10': css`
      padding: ${({ theme }: { theme: Theme }) => theme.core.space.space500};
    `,
    '11': css`
      padding: ${({ theme }: { theme: Theme }) => theme.core.space.space550};
    `,
    '12': css`
      padding: ${({ theme }: { theme: Theme }) => theme.core.space.space600};
    `,
    '13': css`
      padding: ${({ theme }: { theme: Theme }) => theme.core.space.space800};
    `,
  },
}

export const VALID_GROW_VALUES = [
  null,
  undefined,
  true,
  false,
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
] as const

export const VALID_PADDING_VALUES = [
  null,
  undefined,
  true,
  false,
  0, // '0',
  1, // '0.1rem: 1,25px',
  2, // '0.2rem: 2,5px',
  3, // '0.4rem: 5px',
  4, // '0.8rem: 10px',
  5, // '1.2rem: 15px',
  6, // '1.6rem: 20px',
  7, // '2rem: 25px',
  8, // '2.4rem: 30px',
  9, // '3.2rem: 40px',
  10, // '4rem: 50px',
  11, // '4.4rem: 55px',
  12, // '4.8rem: 60px',
  13, // '6.4rem: 80px',
] as const

export type FlexItemProps = React.HTMLAttributes<HTMLDivElement> &
  PropsWithChildren &
  CommonProps & {
    grow?: (typeof VALID_GROW_VALUES)[number]
    $direction?: (typeof dirValues)[number]
    $padding?: (typeof VALID_PADDING_VALUES)[number]
    $gap?: GapSizeType
  }

export const StyledFlexItem = styled.div<FlexItemProps>`
  display: flex;
  ${({ $gap = 'none' }) => ($gap ? flexGroupStyles.gapSizes[$gap] : '')}
  flex-direction: ${({ $direction = 'column' }) =>
    flexGroupStyles.direction[$direction] ?? 'column'};
  ${({ grow }) => {
    if (!grow) {
      return flexItemStyles.growZero
    }
    const result = [flexItemStyles.grow]
    if (typeof grow === 'number') {
      result.push(flexItemStyles.growSizes[grow])
    } else {
      result.push(flexItemStyles.growSizes['1'])
    }
    return result.join('\n')
  }}
  ${({ $padding }) => {
    if ($padding === null || $padding === undefined || $padding === false) {
      return ''
    }
    if ($padding === true) {
      return flexItemStyles.padding['4'] // Default padding (space100)
    }
    if (
      typeof $padding === 'number' &&
      flexItemStyles.padding[$padding] !== undefined
    ) {
      return flexItemStyles.padding[$padding]
    }
    return ''
  }}
`
