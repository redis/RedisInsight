import styled, { css } from 'styled-components'

export const Wrapper = styled.div<{ $isCopyable?: boolean }>`
  position: relative;

  ${({ $isCopyable }) =>
    $isCopyable &&
    css`
      pre {
        padding: 8px 30px 8px 16px;
      }
    `}
`

export const Pre = styled.pre`
  padding: 8px 16px;
`

export const CopyBtn = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
`
