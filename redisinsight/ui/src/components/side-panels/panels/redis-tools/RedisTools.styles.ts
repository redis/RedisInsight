import styled from 'styled-components'

import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'

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

// Both cards share the same eyebrow height, with or without a badge.
export const CardEyebrow = styled(Row)`
  min-height: ${({ theme }) => theme.components.badge.height};
`
