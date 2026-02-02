import styled from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const NoResults = styled.div`
  display: flex;
  height: 100%;
  align-items: center;
  flex-direction: column;
  justify-content: center;
`

export const TableMsgTitle = styled.div`
  font-size: 18px;
  margin-bottom: 12px;
  height: 24px;
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.primary};
`

export const Table = styled.div``
