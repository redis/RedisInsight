import styled from 'styled-components'

import { PaneToolbar } from '../../AgentMemoryWorkspacePage.styles'

export {
  SearchRow,
  LtmSearch,
  ThresholdControl,
  ThresholdInput,
  FilterRow,
  ActiveFilters,
  FilterPill,
  FilterPillRemove,
  FilterClearAll,
} from '../../AgentMemoryWorkspacePage.styles'

export const Toolbar = styled(PaneToolbar)`
  padding-top: 0;
  margin-bottom: ${({ theme }) => theme.core.space.space150};
`
