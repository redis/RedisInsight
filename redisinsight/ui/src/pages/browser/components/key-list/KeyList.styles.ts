import styled from 'styled-components'
import { HTMLAttributes } from 'react'

export const Page = styled.div`
  height: 100%;
  overflow: hidden;
`

export const Content = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral100};
`

export const TableContainer = styled.div<HTMLAttributes<HTMLDivElement>>`
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
