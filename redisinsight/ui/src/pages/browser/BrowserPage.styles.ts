import React from 'react'
import styled, { css } from 'styled-components'
import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { ResizablePanel } from 'uiSrc/components/base/layout'

const BREAKPOINT_TO_HIDE_RESIZE_PANEL = '1280px'

export const Container = styled(Col)`
  max-width: 100vw;
  overflow: hidden;
`

export const Main = styled(Row)`
  padding: 0 ${({ theme }) => theme.core.space.space200};
  overflow: hidden;
  height: 100%;
`

export const ResizableContainer = styled.div`
  position: relative;
`

export const KeysContainer = styled.div`
  position: relative;
  overflow: hidden;
  height: 100%;
  width: 100%;

  @media (min-width: ${BREAKPOINT_TO_HIDE_RESIZE_PANEL}) {
    display: none;
  }
`

export const KeyList = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  border: none;
  z-index: 0;
`

const isOpen = css`
  left: 0;
  @media (max-width: 1123.98px) {
    width: 100%;
  }
`

const isFullWidth = css`
  width: 100%;
  min-width: 100%;
`

const showKeyDetails = css`
  width: 100%;
  height: 100%;
  position: absolute;
  left: 100%;
  top: 0;
  transition: left 0.25s ease;
  will-change: left;
`

export const KeyDetails = styled.div<{
  $isOpen?: boolean
  $isFullWidth?: boolean
  $isMobile?: boolean
}>`
  width: 100%;
  height: 100%;
  position: absolute;
  left: 100%;
  top: 0;
  transition: left 0.25s ease;
  will-change: left;

  ${({ $isOpen }) => $isOpen && isOpen}

  ${({ $isFullWidth }) => $isFullWidth && isFullWidth}
`

export const BackBtn = styled(SecondaryButton)`
  flex-grow: 0;
  align-self: self-start;
  margin: ${({ theme }) =>
    `0 0 ${theme.core.space.space100} ${theme.core.space.space200}`};
  background-color: transparent;
  border: 0;
  box-shadow: none;

  &:hover {
    color: ${({ theme }) => theme.semantic.color.text.neutral700};
  }
`

export const HiddenWrapper = styled.div<{
  $hidden?: boolean
  children: React.ReactNode
}>`
  ${({ $hidden }) => $hidden && 'display: none'};
`

export const BorderedResizablePanel = styled(ResizablePanel)<{
  $isFullWidth?: boolean
  $isKeyDetailsOpen?: boolean
  $showKeyDetails?: boolean
}>`
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  ${({ $isFullWidth }) => $isFullWidth && isFullWidth}
  ${({ $showKeyDetails }) => $showKeyDetails && showKeyDetails}
  ${({ $isKeyDetailsOpen }) => $isKeyDetailsOpen && isOpen}
`
