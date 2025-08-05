import { ComponentProps, ComponentType, PropsWithChildren } from 'react'
import styled from 'styled-components'
import { PaddingSize, pageStyles } from './page.styles'

export type ComponentTypes = keyof JSX.IntrinsicElements | ComponentType<any>
export type PageBodyProps<T extends ComponentTypes = 'main'> =
  PropsWithChildren &
    ComponentProps<T> & {
      className?: string
      /**
       * Sets the max-width of the page,
       * set to `true` to use the default size of `1200px`,
       * set to `false` to not restrict the width,
       * set to a number for a custom width in px,
       * set to a string for a custom width in custom measurement.
       */
      restrictWidth?: boolean | number | string
      /**
       * Sets the HTML element for `PageBody`.
       */
      component?: T
      /**
       * Adjusts the padding
       */
      paddingSize?: PaddingSize
    }

type StyledPageBodyProps = Omit<
  PageBodyProps,
  'component' | 'paddingSize' | 'restrictWidth'
> & {
  $restrictWidth?: boolean | number | string
  $paddingSize?: PaddingSize
}

export const StyledPageBody = styled.main<StyledPageBodyProps>`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  flex: 1 1 100%;
  /* Make sure that inner flex layouts don't get larger than this container */
  max-width: 100%;
  min-width: 0;
  ${({ $restrictWidth = false }) => $restrictWidth && pageStyles.restrictWidth}
  ${({ $paddingSize = 'none' }) =>
    $paddingSize && pageStyles.padding[$paddingSize]}
`
