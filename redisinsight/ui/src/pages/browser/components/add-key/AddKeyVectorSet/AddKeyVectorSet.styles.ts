import React from 'react'
import styled from 'styled-components'

import { Row } from 'uiSrc/components/base/layout/flex'

export const RadioCardList = styled(Row)`
  width: 100%;
`

export const RadioCard = styled(Row)<
  React.LabelHTMLAttributes<HTMLLabelElement> & { $disabled?: boolean }
>`
  border: 1px solid ${({ theme }) => theme.semantic.color.border.secondary500};
  border-radius: ${({ theme }) =>
    theme.components.boxSelectionGroup.item.borderRadius};
  padding: ${({ theme }) => theme.core.space.space150};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
`
