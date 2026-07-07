import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'

export const Container = styled(Col)`
  padding: ${({ theme }) =>
    `${theme.core.space.space100} ${theme.core.space.space150}`};
  min-width: 0;
  overflow-wrap: anywhere;
`

// Text formats (Unicode/ASCII/…) come back as a raw string; preserve their
// newlines and wrap long lines instead of overflowing the row horizontally.
// Kept off the container so the rich viewers (markdown/JSON), which set their
// own layout, don't inherit whitespace preservation.
export const PlainText = styled.div`
  white-space: break-spaces;
  overflow-wrap: anywhere;
  font-size: ${({ theme }) => theme.core.font.fontSize.s14};
  color: ${({ theme }) => theme.semantic.color.text.neutral800};
`
