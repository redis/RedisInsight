import React from 'react'
import styled from 'styled-components'
import { Section } from '@redis-ui/components'

export const ClickableLabel = styled.div<{
  children?: React.ReactNode
}>`
  cursor: pointer;
  flex: 1;
  min-width: 0;
`

export const CollapseButton = styled(Section.Header.CollapseButton)`
  flex-shrink: 0;
`
