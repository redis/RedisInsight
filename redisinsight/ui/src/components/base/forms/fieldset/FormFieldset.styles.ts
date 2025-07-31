/* eslint-disable sonarjs/no-nested-template-literals */
import { HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'
import { Theme } from '@redis-ui/styles'

export type StyledFieldsetProps = HTMLAttributes<HTMLFieldSetElement>

export const StyledFieldset = styled.fieldset`
  border: none;
  margin: 0;
  padding: 0;
  min-width: 0;
`

export interface StyledLegendProps extends HTMLAttributes<HTMLLegendElement> {
  display?: 'visible' | 'hidden'
}

export const StyledLegend = styled.legend<StyledLegendProps>`
  ${({ theme }: { theme: Theme } & StyledLegendProps) => css`
    margin-bottom: ${theme.core.space.space100};
  `}
  padding: 0;
`
