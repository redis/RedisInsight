import styled from 'styled-components'

export const IconWrapper = styled.div<{ children?: React.ReactNode }>`
  margin-left: -${({ theme }) => theme.core.space.space150};
`
