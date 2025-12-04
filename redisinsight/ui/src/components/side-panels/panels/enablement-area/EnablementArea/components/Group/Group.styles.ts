import React from 'react'
import styled from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'

export const GroupHeaderButton = styled.div<
  React.HTMLAttributes<HTMLDivElement>
>`
  display: flex;
  align-items: center;
  justify-content: center;

  width: ${({ theme }: { theme: Theme }) => theme.core.space.space300};
  height: ${({ theme }: { theme: Theme }) => theme.core.space.space300};
  border-radius: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
  cursor: pointer;

  &:hover {
    color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.text.neutral100};
    background-color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.background.neutral200};
  }
`
