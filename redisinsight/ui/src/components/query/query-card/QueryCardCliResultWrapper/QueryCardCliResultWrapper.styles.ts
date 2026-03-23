import React from 'react'
import styled from 'styled-components'
import { CopyButton } from 'uiSrc/components/copy-button'

export const CopyResultButton = styled(CopyButton)`
  position: absolute;
  top: ${({ theme }) => theme.core.space.space050};
  left: ${({ theme }) => theme.core.space.space200};
  z-index: 10;
  opacity: 0;
  transition: opacity 250ms ease-in-out;
`

export const ResultContainer = styled.div<React.HTMLAttributes<HTMLDivElement>>`
  position: relative;

  &:hover ${CopyResultButton} {
    opacity: 1;
  }
`
