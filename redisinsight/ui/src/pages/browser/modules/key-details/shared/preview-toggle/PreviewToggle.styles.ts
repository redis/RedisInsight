import styled from 'styled-components'
import { ToggleButton } from 'uiSrc/components/base/forms/buttons'

export const PreviewToggleButton = styled(ToggleButton)`
  ${({ theme, pressed }) =>
    !pressed && `border-color: ${theme.semantic.color.border.neutral600};`}
`
