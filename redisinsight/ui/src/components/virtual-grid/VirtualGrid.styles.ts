import styled from 'styled-components'
import { ComponentPropsWithRef } from 'react'
import { type Theme } from 'uiSrc/components/base/theme/types'

const PADDING_CELL = '12px'

export const Container = styled.div<ComponentPropsWithRef<'div'>>`
  position: relative;
  height: 100%;
  width: 100%;
`

export const Grid = styled.div<ComponentPropsWithRef<'div'>>`
  scrollbar-width: thin;
  position: relative;
`

export const GridItem = styled.div<
  ComponentPropsWithRef<'div'> & { $odd?: boolean }
>`
  z-index: 1;
  padding: ${PADDING_CELL};
  border: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.secondary700};
  border-left-width: 0;
  border-top-width: 0;
  cursor: pointer;

  background-color: ${({ $odd, theme }: { $odd?: boolean; theme: Theme }) =>
    $odd
      ? theme.semantic.color.background.secondary800
      : theme.semantic.color.background.secondary900};

  &.penult {
    border-right: 0;
  }
`

export const GridItemLast = styled(GridItem)`
  z-index: 6;
  margin-top: -50px;
  padding-top: 16px;
  border-left: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.secondary700};
`

export const GridHeaderCell = styled.hgroup<ComponentPropsWithRef<'hgroup'>>`
  border: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.secondary700};

  &:not(:last-of-type) {
    border-right: 0;
  }

  &:first-of-type {
    border-right: 1px solid
      ${({ theme }: { theme: Theme }) =>
        theme.semantic.color.border.secondary700};
  }

  &:last-of-type,
  &:nth-of-type(2) {
    border-left: 0;
  }

  &:last-of-type {
    border-left: 1px solid
      ${({ theme }: { theme: Theme }) =>
        theme.semantic.color.border.secondary700};
  }
`

export const GridHeaderItem = styled.div<
  ComponentPropsWithRef<'div'> & { $isLast?: boolean }
>`
  overflow: hidden;
  align-items: center;
  line-height: 38px;
  height: 58px;
  text-transform: none;
  z-index: 5;
  padding: ${PADDING_CELL};
`

export const GridHeaderItemSortable = styled.button<
  ComponentPropsWithRef<'button'>
>`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`

export const NoItems = styled.div<ComponentPropsWithRef<'div'>>`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.secondary700};
`
