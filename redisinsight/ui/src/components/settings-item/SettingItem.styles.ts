import styled, { css } from 'styled-components'

export const Container = styled.div`
  height: 40px;
`

export const Input = styled.span<{ $isEditing?: boolean }>`
  height: 31px;
  font-family: 'Graphik', sans-serif;
  border-bottom-right-radius: 0;
  border-top-right-radius: 0;

  ${({ $isEditing }) =>
    $isEditing &&
    css`
      height: 32px;
    `}
`

export const InputHover = styled.div`
  padding-left: 10px;

  & > * {
    line-height: 3.2rem;
  }
`

export const InputLabel = styled.span`
  font:
    normal normal normal 13px/18px Graphik,
    sans-serif;
  font-weight: 500;
`

export const Value = styled.span`
  padding: 0 9px;
  line-height: 3.2rem;
  height: 3.2rem;
  min-width: 150px;
`

export const Title = styled.span`
  font-size: 16px;
`

export const SmallText = styled.span`
  font:
    normal normal normal 14px/24px Graphik,
    sans-serif;
  letter-spacing: -0.14px;
`
