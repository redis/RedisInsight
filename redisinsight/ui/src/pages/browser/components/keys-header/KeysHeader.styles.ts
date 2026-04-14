import React from 'react'
import styled, { css } from 'styled-components'
import { ButtonGroup } from 'uiSrc/components/base/forms/button-group/ButtonGroup'

export const ViewSwitchButton = styled(ButtonGroup.Button)`
  width: 24px !important;
  min-width: 24px !important;
`

export const SortButton = styled.button<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { $isActive?: boolean }
>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background-color: transparent;
  cursor: pointer;
  color: inherit;

  &:hover {
    background-color: ${({ theme }) =>
      theme?.semantic?.color?.background?.neutral300 || 'rgba(0, 0, 0, 0.05)'};
  }

  ${({ $isActive, theme }) =>
    $isActive &&
    css`
      background-color: ${theme?.semantic?.color?.background?.neutral500 ||
      'rgba(0, 0, 0, 0.1)'};
      color: ${theme?.semantic?.color?.icon?.primary600 || 'inherit'};
    `}
`

export const SortDivider = styled.hr`
  border: none;
  border-top: 1px solid
    ${({ theme }) =>
      theme?.semantic?.color?.border?.neutral300 || 'rgba(0,0,0,0.1)'};
  margin: 4px 0;
  width: 100%;
`
