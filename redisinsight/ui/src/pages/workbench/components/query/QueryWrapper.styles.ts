import React from 'react'
import styled from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'

export const ContainerPlaceholder = styled.div<{ children?: React.ReactNode }>`
  display: flex;
  padding: ${({ theme }: { theme: Theme }) =>
    `${theme.core.space.space100} ${theme.core.space.space200}`};
  width: 100%;
  height: 100%;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.components.card.bgColor};
  border: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral500};

  > div {
    border: 1px solid
      ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral500};
    padding: ${({ theme }: { theme: Theme }) =>
      `${theme.core.space.space100} ${theme.core.space.space250}`};
    width: 100%;
  }
`
