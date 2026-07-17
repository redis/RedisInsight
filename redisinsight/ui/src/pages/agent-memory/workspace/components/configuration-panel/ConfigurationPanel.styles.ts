import { HTMLAttributes } from 'react'
import styled from 'styled-components'

import { fontMono, palette } from '../../AgentMemoryWorkspacePage.styles'

export const Container = styled.div<HTMLAttributes<HTMLDivElement>>`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${({ theme }) => theme.core.space.space300};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.core.space.space300};
  background: ${palette.bgSecondary};
`

export const Section = styled.section<HTMLAttributes<HTMLElement>>`
  background: ${palette.bgPrimary};
  border: 1px solid var(--separatorColorLight);
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  padding: ${({ theme }) => theme.core.space.space200}
    ${({ theme }) => theme.core.space.space300};
  max-width: 720px;
`

export const SectionTitle = styled.h2<HTMLAttributes<HTMLHeadingElement>>`
  margin: 0 0 ${({ theme }) => theme.core.space.space150};
  font-size: ${({ theme }) => theme.core.font.fontSize.s16};
  font-weight: 600;
  color: ${palette.text};
`

export const ConfigRow = styled.div<HTMLAttributes<HTMLDivElement>>`
  display: flex;
  align-items: baseline;
  padding: ${({ theme }) => theme.core.space.space100} 0;

  &:not(:last-of-type) {
    border-bottom: 1px solid ${palette.border};
  }
`

export const ConfigLabel = styled.span<HTMLAttributes<HTMLSpanElement>>`
  width: 180px;
  flex-shrink: 0;
  font-size: ${({ theme }) => theme.core.font.fontSize.s13};
  color: ${palette.textSecondary};
`

export const ConfigValue = styled.span<
  HTMLAttributes<HTMLSpanElement> & { $empty?: boolean }
>`
  font-family: ${fontMono};
  font-size: ${({ theme }) => theme.core.font.fontSize.s13};
  color: ${({ $empty }) => ($empty ? palette.textMuted : palette.text)};
  word-break: break-all;
`

export const SectionNote = styled.p<HTMLAttributes<HTMLParagraphElement>>`
  margin: ${({ theme }) => theme.core.space.space150} 0 0;
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
  color: ${palette.textMuted};
  font-style: italic;
`
