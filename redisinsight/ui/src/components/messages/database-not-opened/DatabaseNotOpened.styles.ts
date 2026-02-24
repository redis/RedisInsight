import styled from 'styled-components'

export const ImgWrapper = styled.div`
  img {
    width: 80px;
    margin-left: ${({ theme }) => theme.core.space.space250};
    transform: scale(-1, 1);
  }
`
