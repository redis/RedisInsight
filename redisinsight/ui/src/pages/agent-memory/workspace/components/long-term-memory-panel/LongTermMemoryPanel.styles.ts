import styled from 'styled-components'

import { Card, ChipRow } from '../../AgentMemoryWorkspacePage.styles'

/** A records-list card that opens the detail pane when clicked. Hover and
 * selection both use the Browser's selected-row accent (--euiColorPrimary):
 * a thin full border on hover, a 3px left accent when selected. */
export const RecordCard = styled(Card)<{ $selected?: boolean }>`
  cursor: pointer;
  transition: border-color 120ms ease;

  &:hover {
    border-color: var(--euiColorPrimary);
  }

  ${({ $selected }) =>
    $selected &&
    `
    border-left: 3px solid var(--euiColorPrimary);
  `}

  /* No session footer -> the topic chips are the last row; give them the
   * breathing room the footer's session band otherwise provides. */
  & > ${ChipRow}:last-child {
    padding-bottom: ${({ theme }) => theme.core.space.space100};
  }
`

export {
  Pane,
  PaneHeader,
  PaneHeaderBlock,
  PaneTitle,
  PaneHeaderRight,
  PaneStats,
  Card,
  CardMeta,
  CardFooter,
  CardMetaSession,
  CardSessionButton,
  VisuallyHidden,
  CardId,
  CardText,
  CardList,
  CardDeleteWrapper,
  TypeBadge,
  Chip,
  ChipRow,
  ChipRowLabel,
  ChipRowChips,
  EmptyListText,
  ErrorText,
} from '../../AgentMemoryWorkspacePage.styles'
