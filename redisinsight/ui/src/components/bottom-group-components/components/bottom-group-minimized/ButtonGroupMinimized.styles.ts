import styled from 'styled-components'

import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'

export const ComponentBadge = styled(RiBadge)<{ isActive?: boolean }>`
  height: 18px !important;
  border: none !important;
  cursor: pointer;
  user-select: none;

  &[title] {
    pointer-events: none;
  }

  ${({ isActive, theme }) => {
    console.log('theme', theme)
    // TODO: try to replace with semantic colors once the palette is bigger.
    const bgColorActive =
      theme.name === 'dark'
        ? theme.semantic.color.background.primary300
        : theme.semantic.color.background.primary300
    const bgColorHover =
      theme.name === 'dark'
        ? theme.semantic.color.background.primary500
        : theme.semantic.color.background.primary200

    const color =
      theme.name === 'dark'
        ? theme.semantic.color.text.primary600
        : theme.semantic.color.text.primary600

    return `
    ${isActive ? `background-color: ${bgColorActive} !important;` : ''}
    ${isActive ? `color: ${color} !important;` : ''}
    &:hover {
      background-color: ${bgColorHover} !important;
      color: ${color} !important;
    }
  `
  }}
`

export const ContainerMinimized = styled.div`
  display: flex;
  align-items: center;
  padding-left: ${({ theme }) => theme.core.space.space050};
  height: 26px;
  line-height: 26px;
  border-left: 1px solid
    ${({ theme }) => theme.semantic.color.border.neutral500};
  border-right: 1px solid
    ${({ theme }) => theme.semantic.color.border.neutral500};
`
