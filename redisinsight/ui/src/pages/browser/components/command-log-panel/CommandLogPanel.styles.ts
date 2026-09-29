import styled from 'styled-components'
import { CommonProps, Theme } from 'uiSrc/components/base/theme/types'

/**
 * Props accepted by the panel's block elements.
 *
 * `ComponentPropsWithRef` brings in `children`, the standard DOM props and
 * `ref`; `CommonProps` adds `data-testid`, which React does not allow on
 * custom components unless the props type declares it.
 */
type PanelBlockProps = React.ComponentPropsWithRef<'div'> & CommonProps

export const Container = styled.div<PanelBlockProps>`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
`

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }: { theme: Theme }) => theme.core.space.space100};
  padding: ${({ theme }: { theme: Theme }) =>
    `${theme.core.space.space100} ${theme.core.space.space150}`};
  border-bottom: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral500};
  flex-shrink: 0;
`

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
`

export const Title = styled.span`
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0.8;
`

export const List = styled.div<PanelBlockProps>`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: ${({ theme }: { theme: Theme }) => theme.core.space.space100};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }: { theme: Theme }) => theme.core.space.space100};
`

export const Group = styled.div<PanelBlockProps>`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

export const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  line-height: 14px;
  padding: 2px 4px;
  border-radius: 3px;
  background: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral100};
`

export const Count = styled.span<PanelBlockProps>`
  margin-left: auto;
  flex-shrink: 0;
  opacity: 0.6;
  font-variant-numeric: tabular-nums;
`

export const Commands = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding-left: ${({ theme }: { theme: Theme }) => theme.core.space.space100};
  border-left: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral500};
`

export const CommandRow = styled.div<PanelBlockProps>`
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 1px 4px;
  border-radius: 3px;

  &:hover {
    background: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.background.neutral100};
  }
`

export const Repeat = styled.span`
  flex-shrink: 0;
  font-size: 10px;
  opacity: 0.6;
`

export const Time = styled.span`
  font-variant-numeric: tabular-nums;
`

export const Operation = styled.span`
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const CommandLine = styled.div`
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 12px;
  line-height: 16px;
  word-break: break-all;
  cursor: text;
  user-select: text;
`

export const Placeholder = styled.div<PanelBlockProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: ${({ theme }: { theme: Theme }) => theme.core.space.space200};
  text-align: center;
  opacity: 0.6;
  font-size: 12px;
`
