import React from 'react'
import styled from 'styled-components'

type LayoutProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode
}

export const KeysBrowserRoot = styled.div<LayoutProps>`
  display: flex;
  flex-direction: column;
  height: 100%;
`

export const KeysBrowserHeaderContainer = styled.div<LayoutProps>`
  width: 100%;
  padding: 4px 12px;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  position: relative;
`

export const KeysBrowserContentContainer = styled.div<LayoutProps>`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
`

export const KeysBrowserFooterContainer = styled.div<LayoutProps>`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  padding: 4px 12px;
`
