import styled, { css } from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Wrapper = styled.div<{ $transformOnHover?: boolean }>`
  position: relative;

  ${({ $transformOnHover }) =>
    $transformOnHover &&
    css`
      &:hover {
        .dot {
          transform: translateY(-1px);
        }
      }
    `}
`

export const Dot = styled.span`
  position: absolute;
  background: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.success500};
  top: -4px;
  right: -4px;
  z-index: 1;

  width: 12px;
  height: 12px;
  border-radius: 50%;

  transition: transform 250ms ease-in-out;
`

export const BadgeContainer = styled.div`
  display: flex;
  align-items: center;
`

export const Badge = styled.span`
  font-size: 8px;
  line-height: 12px;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.success500};
  border: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.success500};
  color: #fff7ea;
  border-radius: 2px;
  padding: 0 4px;
  margin-left: 8px;

  transition: transform 250ms ease-in-out;
  pointer-events: none;

  .euiBadge__content {
    min-height: 12px;
  }
`
