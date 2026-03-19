import { ReactNode, HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Theme } from 'uiSrc/components/base/theme/types'

export const Page = styled(Col)`
  height: 100%;
  overflow: hidden;
`

export const Content = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.components.card.bgColor};
`

export const KeyListTable = styled.div<HTMLAttributes<HTMLDivElement>>`
  height: 100%;
`

export const Table = styled.div<{
  $withoutFooter?: boolean
  children?: ReactNode
}>`
  height: 100%;

  .deleteAnchor {
    margin-right: -10px;
  }

  .ReactVirtualized__Table__headerRow {
    background-color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.background.neutral400};
    border-bottom: 1px solid
      ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral500};
    text-transform: none;
    padding-left: 20px !important;

    .ReactVirtualized__Table__headerColumn {
      &:first-of-type {
        border-left: 3px solid transparent;
      }
      .flex-row.fluid {
        display: flex;
        align-items: center;

        /* Container for the sorting arrow */
        & > div:nth-child(2):not([class*='resize']) {
          display: flex;
          flex: 0 0 20px;
          margin-left: -20px !important;
          padding: 0 !important;
          background: transparent !important;
          z-index: 1;

          button {
            padding: 0 !important;
            background: transparent !important;
          }
        }
      }

      /* Reserve space for the arrow within the label button to avoid shifting */
      [data-testid='score-button'] {
        padding-right: 20px !important;
      }
    }
  }

  .ReactVirtualized__Table__row {
    .ReactVirtualized__Table__rowColumn {
      .moveOnHoverKey {
        transition: transform ease 0.3s;

        &.hide {
          transform: translateX(-8px);
        }
      }

      .showOnHoverKey {
        display: none;

        &.show {
          display: block !important;
        }
      }
    }

    &:hover {
      .ReactVirtualized__Table__rowColumn {
        .moveOnHoverKey {
          transform: translateX(-8px);
        }

        .showOnHoverKey {
          display: block !important;
        }
      }
    }
  }

  ${({ $withoutFooter }) =>
    $withoutFooter &&
    css`
      border-bottom: 1px solid
        ${({ theme }: { theme: Theme }) =>
          theme.semantic.color.border.neutral500};
    `}
`
