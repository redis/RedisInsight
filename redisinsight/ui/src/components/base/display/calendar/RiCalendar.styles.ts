import { HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'
import { ChevronRightIcon } from 'uiSrc/components/base/icons'
import { Row } from '../../layout/flex'

const ROTATION: Record<string, string> = {
  left: '180deg',
  right: '0deg',
  up: '-90deg',
  down: '90deg',
}

export const Chevron = styled(ChevronRightIcon)<{
  $orientation?: string
}>`
  transition: transform 0.15s ease;
  ${({ $orientation }) =>
    $orientation &&
    css`
      transform: rotate(${ROTATION[$orientation] ?? '0deg'});
    `}
`

export const CalendarRoot = styled.div<HTMLAttributes<HTMLDivElement>>`
  --cell-size: ${({ theme }) => theme.core.space.space300};
  --cell-radius: ${({ theme }) => theme.core.space.space050};

  .rdp-root {
    --rdp-accent-color: ${({ theme }) =>
      theme.semantic.color.background.primary500};
    --rdp-accent-background-color: ${({ theme }) =>
      theme.semantic.color.background.primary200};
    background: ${({ theme }) => theme.semantic.color.background.neutral100};
    padding: ${({ theme }) => theme.core.space.space150};
    font-family: inherit;
    width: fit-content;
  }

  .rdp-months {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.core.space.space200};
  }

  .rdp-month {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.core.space.space200};
    width: 100%;
    margin: 0;
  }

  .rdp-nav {
    position: absolute;
    inset-inline: 0;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({ theme }) => theme.core.space.space050};
  }

  .rdp-button_previous,
  .rdp-button_next {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--cell-size);
    height: var(--cell-size);
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: var(--cell-radius);
    color: ${({ theme }) => theme.semantic.color.icon.neutral700};
    user-select: none;

    &:hover {
      background: ${({ theme }) => theme.semantic.color.background.neutral200};
    }

    &[aria-disabled='true'] {
      opacity: 0.5;
      cursor: default;
    }
  }

  [dir='rtl'] .rdp-button_next svg {
    transform: rotate(180deg);
  }

  [dir='rtl'] .rdp-button_previous svg {
    transform: rotate(180deg);
  }

  .rdp-month_caption {
    display: flex;
    align-items: center;
    justify-content: center;
    height: var(--cell-size);
    width: 100%;
    padding: 0 var(--cell-size);
  }

  .rdp-caption_label {
    font-size: ${({ theme }) => theme.core.font.fontSize.s14};
    font-weight: 500;
    user-select: none;
  }

  .rdp-dropdowns {
    display: flex;
    align-items: center;
    justify-content: center;
    height: var(--cell-size);
    width: 100%;
    gap: ${({ theme }) => theme.core.space.space100};
    font-size: ${({ theme }) => theme.core.font.fontSize.s14};
    font-weight: 500;
  }

  .rdp-dropdown_root {
    position: relative;
    border-radius: var(--cell-radius);
  }

  .rdp-dropdown {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }

  .rdp-weekdays {
    display: flex;
  }

  .rdp-weekday {
    flex: 1;
    font-size: ${({ theme }) => theme.core.font.fontSize.s12};
    font-weight: 400;
    color: ${({ theme }) => theme.semantic.color.text.neutral500};
    user-select: none;
    text-align: center;
    width: var(--cell-size);
    height: var(--cell-size);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .rdp-week {
    display: flex;
    width: 100%;
    margin-top: ${({ theme }) => theme.core.space.space025};
  }

  .rdp-day {
    position: relative;
    width: var(--cell-size);
    height: var(--cell-size);
    text-align: center;
    padding: 0;
    border-radius: var(--cell-radius);
    user-select: none;
  }

  .rdp-day_button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: var(--cell-radius);
    font-size: ${({ theme }) => theme.core.font.fontSize.s14};
    color: ${({ theme }) => theme.semantic.color.text.neutral700};
    font-family: inherit;
    line-height: 1;

    &:hover {
      background: ${({ theme }) => theme.semantic.color.background.neutral200};
    }
  }

  .rdp-today:not(.rdp-selected) .rdp-day_button {
    background: ${({ theme }) => theme.semantic.color.background.neutral200};
    font-weight: 700;
    border-radius: var(--cell-radius);
  }

  .rdp-selected .rdp-day_button {
    background: ${({ theme }) => theme.semantic.color.background.primary500};
    color: ${({ theme }) => theme.semantic.color.text.neutral100};
    font-weight: 600;

    &:hover {
      background: ${({ theme }) => theme.semantic.color.background.primary500};
    }
  }

  .rdp-outside .rdp-day_button {
    color: ${({ theme }) => theme.semantic.color.text.neutral500};
    opacity: 0.5;
  }

  .rdp-disabled .rdp-day_button {
    opacity: 0.5;
    cursor: default;
  }

  .rdp-hidden {
    visibility: hidden;
  }

  .rdp-range_start .rdp-day_button {
    background: ${({ theme }) => theme.semantic.color.background.primary500};
    color: ${({ theme }) => theme.semantic.color.text.neutral100};
    border-radius: var(--cell-radius) 0 0 var(--cell-radius);
  }

  .rdp-range_middle .rdp-day_button {
    background: ${({ theme }) => theme.semantic.color.background.primary200};
    color: ${({ theme }) => theme.semantic.color.text.neutral700};
    border-radius: 0;
  }

  .rdp-range_end .rdp-day_button {
    background: ${({ theme }) => theme.semantic.color.background.primary500};
    color: ${({ theme }) => theme.semantic.color.text.neutral100};
    border-radius: 0 var(--cell-radius) var(--cell-radius) 0;
  }

  table.rdp-month_grid {
    width: 100%;
    border-collapse: collapse;
  }
`

export const WeekNumberCell = styled(Row).attrs({
  align: 'center',
  justify: 'center',
})`
  width: var(--cell-size);
  height: var(--cell-size);
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
  color: ${({ theme }) => theme.semantic.color.text.neutral500};
  user-select: none;
  text-align: center;
`
