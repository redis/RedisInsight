import styled from 'styled-components'

export const LineIndicator = styled.div<{ $backgroundColor: string }>`
  position: absolute;
  left: 0;
  top: 1px;
  bottom: 1px;
  width: 3px;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
`
