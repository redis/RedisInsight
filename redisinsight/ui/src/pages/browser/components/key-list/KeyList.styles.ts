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

  /* Hover effects for ReactVirtualized table rows */
  /* Used by: KeyRowSize, KeyRowTTL (moveOnHoverKey), DeleteKeyPopover (showOnHoverKey) */
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
          display: block;
        }
      }
    }

    &:hover {
      .ReactVirtualized__Table__rowColumn {
        .moveOnHoverKey {
          transform: translateX(-8px);
        }

        .showOnHoverKey {
          display: block;
        }
      }
    }
  }
`

export const Table = styled.div<{
  $withoutFooter?: boolean
  children?: ReactNode
}>`
  height: 100%;

  .deleteAnchor {
    margin-right: -10px;
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
