import { BoxSelectionGroup } from '@redis-ui/components'
import styled from 'styled-components'

export const StyledFieldBox = styled(BoxSelectionGroup.Item.Compose)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  padding: ${({ theme }) => theme.core.space.space100};
  gap: ${({ theme }) => theme.components.boxSelectionGroup.defaultItem.gap};
`

export const BoxHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const BoxHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.components.boxSelectionGroup.defaultItem.gap};
`

export const BoxContent = styled.div``
