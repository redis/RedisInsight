import { HTMLAttributes } from 'react'
import styled from 'styled-components'

import { CommonProps } from 'uiSrc/components/base/theme/types'

export const Container = styled.div<
  CommonProps & HTMLAttributes<HTMLDivElement>
>`
  font-size: ${({ theme }) => theme.core.font.fontSize.s14};
  color: ${({ theme }) => theme.semantic.color.text.neutral800};
  line-height: 1.5;
  overflow-wrap: break-word;

  > :first-child {
    margin-top: 0;
  }

  > :last-child {
    margin-bottom: 0;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: ${({ theme }) => theme.core.space.space200} 0
      ${({ theme }) => theme.core.space.space100};
    font-weight: ${({ theme }) => theme.core.font.fontWeight.semiBold};
  }

  h1 {
    font-size: ${({ theme }) => theme.core.font.fontSize.s20};
  }

  h2 {
    font-size: ${({ theme }) => theme.core.font.fontSize.s18};
  }

  h3 {
    font-size: ${({ theme }) => theme.core.font.fontSize.s16};
  }

  h4,
  h5,
  h6 {
    font-size: ${({ theme }) => theme.core.font.fontSize.s14};
  }

  p {
    margin: ${({ theme }) => theme.core.space.space100} 0;
  }

  ul,
  ol {
    margin: ${({ theme }) => theme.core.space.space100} 0;
    padding-left: ${({ theme }) => theme.core.space.space300};
  }

  ul {
    list-style-type: disc;
  }

  ol {
    list-style-type: decimal;
  }

  code {
    padding: 0 ${({ theme }) => theme.core.space.space050};
    font-family: ${({ theme }) =>
      theme.core.font.fontFamily.sourceCodeProRegular};
    font-size: ${({ theme }) => theme.core.font.fontSize.s13};
    background-color: ${({ theme }) =>
      theme.semantic.color.background.neutral300};
    border-radius: ${({ theme }) => theme.core.space.space050};
  }

  pre {
    margin: ${({ theme }) => theme.core.space.space100} 0;
    padding: ${({ theme }) => theme.core.space.space150};
    background-color: ${({ theme }) =>
      theme.semantic.color.background.neutral300};
    border-radius: ${({ theme }) => theme.core.space.space050};
    overflow-x: auto;

    code {
      padding: 0;
      background-color: transparent;
    }
  }

  blockquote {
    margin: ${({ theme }) => theme.core.space.space100} 0;
    padding-left: ${({ theme }) => theme.core.space.space150};
    border-left: 2px solid
      ${({ theme }) => theme.semantic.color.border.neutral500};
    color: ${({ theme }) => theme.semantic.color.text.neutral600};
  }

  table {
    margin: ${({ theme }) => theme.core.space.space100} 0;
    border-collapse: collapse;
  }

  th,
  td {
    padding: ${({ theme }) => theme.core.space.space050}
      ${({ theme }) => theme.core.space.space150};
    border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  }

  th {
    font-weight: ${({ theme }) => theme.core.font.fontWeight.semiBold};
    background-color: ${({ theme }) =>
      theme.semantic.color.background.neutral300};
  }

  a {
    color: ${({ theme }) => theme.semantic.color.text.informative400};

    &:hover {
      text-decoration: underline;
    }
  }

  hr {
    margin: ${({ theme }) => theme.core.space.space150} 0;
    border: none;
    border-top: 1px solid
      ${({ theme }) => theme.semantic.color.border.neutral500};
  }
`
