import React from 'react'
import styled from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'

export const GroupHeaderButton = styled.div<
  React.HTMLAttributes<HTMLDivElement>
>`
  display: flex;
  align-items: center;
  justify-content: center;

  width: ${({ theme }: { theme: Theme }) => theme.core.space.space300};
  height: ${({ theme }: { theme: Theme }) => theme.core.space.space300};
  border-radius: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
  cursor: pointer;

  &:hover {
    color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.text.neutral100};
    background-color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.background.neutral200};
  }
`

export const EnablementAreaWrapper = styled.div`
  .euiAccordion {
    backface-visibility: hidden;

    .group-header-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .onboardingPopoverAnchor {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
    }

    .group-header {
      display: flex;
      align-items: center;
      letter-spacing: -0.12px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .divider {
      visibility: hidden;
      width: 100%;
      height: 1px;
      position: absolute;
      bottom: 0;
      hr {
        border: none;
        height: 1px;
        width: 100%;
        background-color: ${({ theme }: { theme: Theme }) =>
          theme.semantic.color.border.neutral500};
      }
    }
  }

  .euiAccordion__button {
    padding: 5px 0;
    flex-grow: 1;

    & > span {
      overflow: hidden;
    }

    .euiIEFlexWrapFix {
      flex-grow: 1;
    }

    &:hover {
      background-color: ${({ theme }: { theme: Theme }) =>
        theme.semantic.color.background.neutral300};
    }
  }

  .euiAccordion-isOpen {
    min-width: 100%;

    .divider {
      visibility: visible;
    }
  }

  .euiAccordion__triggerWrapper,
  .euiAccordion__childWrapper {
    border: none;
    background-color: transparent;
  }

  .euiAccordion__childWrapper {
    padding-left: 0;

    .euiListGroupItem {
      button {
        padding: 5px 8px;
        line-height: 20px;
      }

      .euiListGroupItem__label {
        font:
          normal normal normal 12px/14px Graphik,
          sans-serif;
        white-space: break-spaces;
      }
    }

    .euiListGroupItem:hover {
      color: ${({ theme }: { theme: Theme }) =>
        theme.components.typography.colors.primary};
      background-color: ${({ theme }: { theme: Theme }) =>
        theme.semantic.color.background.neutral300};
    }
  }

  /* Tutorial items as cards (target design) – RiAccordion/Section body list items */
  [data-testid^='ri-accordion-body'] .RI-list-group-item {
    border-radius: ${({ theme }: { theme: Theme }) =>
      theme.core.space.space100};
    background-color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.background.neutral200};
    border: 1px solid
      ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral400};
    margin-bottom: ${({ theme }: { theme: Theme }) =>
      theme.core.space.space100};
    padding: ${({ theme }: { theme: Theme }) => theme.core.space.space100}
      ${({ theme }: { theme: Theme }) => theme.core.space.space150};
  }

  [data-testid^='ri-accordion-body'] .RI-list-group-item:hover {
    background-color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.background.neutral300};
  }
`

export const Hide = styled.div`
  display: none;
`
