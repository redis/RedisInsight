import styled from 'styled-components'
import React from 'react'

export const NavigationTabContainer = styled.div<
  React.HTMLAttributes<HTMLDivElement> & { isSelected?: boolean }
>`
  border: 1px solid ${({ isSelected }) => (isSelected ? '#40A5CD' : '#B9C2C6')};
  background-color: ${({ isSelected }) => (isSelected ? '#F2FBFF' : 'inherit')};
  border-radius: 8px;
  padding: 10px;
`
