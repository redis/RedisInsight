import styled from 'styled-components'

export const CustomHorizontalRule = styled.div`
  margin: 12px 0;
  width: 100%;
  text-align: center;
  position: relative;

  &:before,
  &:after {
    content: '';
    display: block;
    width: 47%;
    height: 1px;
    background: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.background.neutral500};
    position: absolute;
    top: 50%;
  }

  &:after {
    right: 0;
  }
`
