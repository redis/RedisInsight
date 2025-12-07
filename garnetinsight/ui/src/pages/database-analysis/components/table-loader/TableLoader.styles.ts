import React from 'react'
import styled from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'
import LoadingContent from 'uiSrc/components/base/layout/loading-content/LoadingContent'
import { SingleLine } from 'uiSrc/components/base/layout/loading-content/loading-content.styles'

export const Container = styled.div<React.HTMLAttributes<HTMLDivElement>>`
  margin-top: ${({ theme }: { theme: Theme }) => theme.core.space.space250};
`
export const TableLoaderTitle = styled(LoadingContent)`
  ${SingleLine} {
    height: ${({ theme }) => theme.core.space.space550} !important;
    margin-bottom: ${({ theme }) => theme.core.space.space150};
  }
`
export const TableLoaderTable = styled(LoadingContent)`
  ${SingleLine} {
    height: ${({ theme }) => theme.core.space.space400} !important;
    margin-bottom: ${({ theme }) => theme.core.space.space100};

    &:last-child:not(:only-child) {
      width: 100% !important;
    }
  }
`
