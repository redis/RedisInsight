import { css } from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'

export const gapSizes = ['none', 'xs', 's', 'm', 'l', 'xl', 'xxl'] as const
export const columnCount = [1, 2, 3, 4] as const

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

export const flexItemStyles = {
  growZero: css`
    flex-grow: 0;
    flex-basis: auto;
  `,
  grow: css`
    flex-basis: 0;
    min-width: 0;
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
    0: css`
      padding: ${({ theme }: { theme: Theme }) => theme.core.space.space000};
    `,
    1: css`
      padding: ${({ theme }: { theme: Theme }) => theme.core.space.space010};
    `,
    2: css`
      padding: ${({ theme }: { theme: Theme }) => theme.core.space.space025};
    `,
    3: css`
      padding: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
    `,
    4: css`
      padding: ${({ theme }: { theme: Theme }) => theme.core.space.space100};
    `,
    5: css`
      padding: ${({ theme }: { theme: Theme }) => theme.core.space.space150};
    `,
    6: css`
      padding: ${({ theme }: { theme: Theme }) => theme.core.space.space200};
    `,
    7: css`
      padding: ${({ theme }: { theme: Theme }) => theme.core.space.space250};
    `,
    8: css`
      padding: ${({ theme }: { theme: Theme }) => theme.core.space.space300};
    `,
    9: css`
      padding: ${({ theme }: { theme: Theme }) => theme.core.space.space400};
    `,
    10: css`
      padding: ${({ theme }: { theme: Theme }) => theme.core.space.space500};
    `,
    11: css`
      padding: ${({ theme }: { theme: Theme }) => theme.core.space.space550};
    `,
    12: css`
      padding: ${({ theme }: { theme: Theme }) => theme.core.space.space600};
    `,
    13: css`
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
