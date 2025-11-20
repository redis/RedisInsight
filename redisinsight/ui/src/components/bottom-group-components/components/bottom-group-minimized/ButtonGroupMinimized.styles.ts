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

  background-color: transparent !important;

  ${({ isActive, theme }) => {
    // TODO: try to replace with semantic colors once the palette is bigger.
    const bgColorActive =
      theme.name === 'dark'
        ? theme.semantic.color.background.primary400
        : theme.semantic.color.background.primary400
    const bgColorHover =
      theme.name === 'dark'
        ? theme.semantic.color.background.primary500
        : theme.semantic.color.background.primary300

    const textColorActiveHover = theme.semantic.color.text.primary50

    return `
    ${isActive ? `background-color: ${bgColorActive} !important;` : ''}
    ${isActive ? `color: ${textColorActiveHover} !important;` : ''}
    &:hover {
      background-color: ${bgColorHover} !important;
      color: ${textColorActiveHover} !important;
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
