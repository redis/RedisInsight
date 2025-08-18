import React from 'react'

import {
  StyledFieldset,
  StyledFieldsetProps,
  StyledLegend,
  StyledLegendProps,
} from './RiFormFieldset.styles'

export interface RiFormFieldsetProps extends StyledFieldsetProps {
  legend?: StyledLegendProps
}

export const RiFormFieldset = ({
  legend,
  children,
  ...props
}: RiFormFieldsetProps) => (
  <StyledFieldset {...props}>
    {legend && legend.display !== 'hidden' && <StyledLegend {...legend} />}
    {children}
  </StyledFieldset>
)
