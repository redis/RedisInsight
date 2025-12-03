import React from 'react'
import styled from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'

export const Wrapper = styled.div<React.HTMLAttributes<HTMLDivElement>>`
  border: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral500};
  border-radius: ${({ theme }: { theme: Theme }) =>
    theme.components.card.borderRadius};
  padding: ${({ theme }: { theme: Theme }) => theme.core.space.space200};
`
