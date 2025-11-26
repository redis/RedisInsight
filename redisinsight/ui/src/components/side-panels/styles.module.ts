import styled, { css } from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'

export const StyledSidePanel = styled(Col)<{ isFullScreen?: boolean }>`
  height: 100%;
  width: 100%;
  padding-right: ${({ theme }) => theme.core.space.space200};

  ${({ isFullScreen }) =>
    isFullScreen &&
    css`
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      padding-inline: ${({ theme }) => theme.core.space.space200};
      z-index: 1001;
    `}
`

export const StyledInnerSidePanel = styled(Col)<{ isFullScreen?: boolean }>`
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral100};
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  border-radius: ${({ theme }) => theme.core.space.space100};
  padding: ${({ theme }) => theme.core.space.space100};
  height: 100%;
`
