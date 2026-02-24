import styled, { css } from 'styled-components'
import { HTMLAttributes } from 'react'
import { Col, Row } from 'uiSrc/components/base/layout/flex'

export const MainWrapper = styled(Row)`
  height: 100%;
  width: 100%;
  position: relative;
`

interface MainPanelProps {
  $insightsOpen?: boolean
}

export const MainPanel = styled(Col)<MainPanelProps>`
  height: 100%;
  width: 100%;

  ${({ $insightsOpen }) =>
    $insightsOpen &&
    css`
      max-width: calc(100% - 460px);

      @media only screen and (max-width: 1440px) {
        max-width: calc(100% - 380px);
      }
    `}
`

type InsightsWrapperProps = HTMLAttributes<HTMLDivElement> & {
  $isOpen?: boolean
}

export const InsightsWrapper = styled.div<InsightsWrapperProps>`
  width: 0;
  position: relative;
  ${({ $isOpen }) =>
    $isOpen &&
    css`
      width: 460px;

      @media only screen and (max-width: 1440px) {
        width: 380px;
      }
    `}
`
