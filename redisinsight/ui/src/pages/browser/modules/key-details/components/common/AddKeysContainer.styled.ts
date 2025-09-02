import React from 'react'
import styled from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'
import { Col } from 'uiSrc/components/base/layout/flex'

export const AddKeysContainer = styled.div<
  React.HTMLAttributes<HTMLDivElement> & {
    theme: Theme
  }
>`
  padding: ${({ theme }) => theme.core.space.space150};
  position: absolute;
  bottom: 0;
  background: ${({ theme }) => theme.semantic.color.background.neutral300};
  border-style: solid;
  border-width: 0;
  border-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.border.neutral500};
  border-top-width: 1px;
  width: 100%;

  z-index: 2;

  max-height: 100%;
  overflow-y: auto;

  &.contentActive {
    border-color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.border.neutral500};
    border-bottom-width: 1px;
  }
`
export const EntryContent = styled(Col)`
  max-height: 234px;
  scroll-padding-bottom: 60px;
  overflow-y: auto;
`
