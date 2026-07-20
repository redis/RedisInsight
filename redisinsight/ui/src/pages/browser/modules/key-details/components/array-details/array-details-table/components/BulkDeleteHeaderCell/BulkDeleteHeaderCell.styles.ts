import styled from 'styled-components'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { DestructiveButton } from 'uiSrc/components/base/forms/buttons'

// Shown in the actions-column header only while rows are selected.
export const DangerAction = styled(FlexItem)`
  display: flex;
  justify-content: center;
`

// Compact rounded destructive button: red fill, white trash. Overrides the
// label-button min-width/padding so it reads as a square icon action that
// visually rhymes with the (blue) selection checkboxes.
export const TriggerButton = styled(DestructiveButton)`
  min-width: unset;
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: ${({ theme }) => theme.core?.space.space100};

  /* Enlarge the trash: BaseButton doesn't forward its size to the icon, so it
     renders at the small default; bump it for legibility in the header. */
  svg {
    width: 20px;
    height: 20px;
  }
`
