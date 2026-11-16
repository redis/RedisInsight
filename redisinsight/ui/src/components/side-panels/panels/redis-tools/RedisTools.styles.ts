import styled from 'styled-components'

import { Icon } from 'uiSrc/components/base/icons'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { Title } from 'uiSrc/components/base/text/Title'

export const Container = styled(Col)`
  height: 100%;
  overflow-y: auto;
  padding: ${({ theme }) => theme.core.space.space200};
`

export const CommandBox = styled(Row)`
  padding: ${({ theme }) => theme.core.space.space150}
    ${({ theme }) => theme.core.space.space150}
    ${({ theme }) => theme.core.space.space150}
    ${({ theme }) => theme.core.space.space200};
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral300};
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  border-radius: ${({ theme }) => theme.core.space.space100};
`

export const CommandText = styled(Text)`
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  white-space: nowrap;
  font-family: ${({ theme }) => theme.core.font.fontFamily.sourceCodeProRegular};
`

export const StepsBox = styled(Row)`
  padding: ${({ theme }) => theme.core.space.space150}
    ${({ theme }) => theme.core.space.space200};
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  border-radius: ${({ theme }) => theme.core.space.space100};
`

export const Card = styled(Col)`
  flex: 1 1 0;
  min-width: 0;
  padding: ${({ theme }) => theme.core.space.space200};
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral200};
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  border-radius: ${({ theme }) => theme.core.space.space100};
`

// Keeps its size when the text next to it wraps.
export const FixedIcon = styled(Icon)`
  flex-shrink: 0;
`

// Wraps inside the card even when a word is wider than the space left next to the icon.
export const CardTitle = styled(Title)`
  min-width: 0;
  overflow-wrap: anywhere;
`

// Both cards share the same eyebrow height, with or without a badge.
export const CardEyebrow = styled(Row)`
  min-height: ${({ theme }) => theme.components.badge.height};
`
