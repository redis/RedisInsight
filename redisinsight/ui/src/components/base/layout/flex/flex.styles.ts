import styled, { css } from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'
import { flexItemStyles } from './flex.constants'
import { FlexItemProps, GridProps, StyledFlexProps } from './flex.types'

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

export const StyledGrid = styled.div<GridProps>`
  display: grid;
  grid-template-columns: ${({ columns = 1 }) =>
    flexGridStyles.columns[columns] ?? flexGridStyles.columns['1']};
  gap: ${({ gap = 'none' }) => flexGroupStyles.gapSizes[gap] ?? '0'};
  ${({ centered = false }) => (centered ? flexGroupStyles.centered : '')}
  ${({ responsive = false }) => (responsive ? flexGridStyles.responsive : '')}
`

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

export const StyledFlexItem = styled.div<FlexItemProps>`
  display: flex;
  gap: ${({ $gap = 'none' }) => ($gap ? flexGroupStyles.gapSizes[$gap] : '')};
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
    if (flexItemStyles.padding[$padding] !== undefined) {
      return flexItemStyles.padding[$padding]
    }
    return ''
  }}
`
