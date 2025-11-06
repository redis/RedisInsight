import styled, { css } from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'
import React from 'react'
import { Theme } from 'uiSrc/components/base/theme/types'

export const DryRunPanelContainer = styled(Col)<
  React.ComponentProps<typeof Col> & { isFullScreen?: boolean }
>`
  border-left: 1px solid
  ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.border.informative100};
  padding: 2.4rem;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.components.section.bgColor};
  ${({ isFullScreen }) =>
    isFullScreen
      ? css`
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 15;
        `
      : css`
          width: 524px;
          overflow: auto;
        `}
`
