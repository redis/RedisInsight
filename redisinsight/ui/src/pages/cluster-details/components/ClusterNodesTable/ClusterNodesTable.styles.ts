import styled from 'styled-components'

export const TableWrapper = styled.div<{ children: React.ReactNode }>`
  margin: ${({ theme }) => theme.core.space.space050};
`
