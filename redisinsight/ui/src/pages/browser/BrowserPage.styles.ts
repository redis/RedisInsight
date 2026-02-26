import React from 'react'
import styled, { css } from 'styled-components'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import {
  ResizableContainer,
  ResizablePanel,
} from 'uiSrc/components/base/layout'
import { Theme } from 'uiSrc/components/base/theme/types'

export const PageContainer = styled(Col)`
  max-width: 100vw;
  overflow: hidden;
`

export const MainContent = styled(Row)`
  padding: 0 ${({ theme }) => theme.core.space.space200};
  overflow: hidden;
`

export const BackButtonWrapper = styled.div`
  align-self: self-start;
  margin: ${({ theme }) =>
    `0 0 ${theme.core.space.space100} ${theme.core.space.space200}`};

  > button {
    background-color: transparent;
    border: 0;
    box-shadow: none;
  }
`

export const SearchPanelWrapper = styled.div<{
  $hidden: boolean
  children?: React.ReactNode
}>`
  ${({ $hidden }) =>
    $hidden &&
    css`
      display: none;
    `}
`

export const StyledResizableContainer = styled(ResizableContainer)`
  position: relative;
`

const fullWidthStyles = css`
  width: 100%;
  min-width: 100%;
`

const keyDetailsStyles = css`
  width: 100%;
  height: 100%;
  position: absolute;
  left: 100%;
  top: 0;
  transition: left 0.25s ease;
  will-change: left;
`

const keyDetailsOpenStyles = css`
  left: 0;

  @media (max-width: 1123.98px) {
    width: 100%;
  }
`

export const BorderedResizablePanel = styled(ResizablePanel)<{
  $fullWidth?: boolean
  $keyDetails?: boolean
  $keyDetailsOpen?: boolean
}>`
  border-radius: ${({ theme }: { theme: Theme }) =>
    theme.components.card.borderRadius};
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  ${({ $fullWidth }) => $fullWidth && fullWidthStyles}
  ${({ $keyDetails }) => $keyDetails && keyDetailsStyles}
  ${({ $keyDetailsOpen }) => $keyDetailsOpen && keyDetailsOpenStyles}
`
