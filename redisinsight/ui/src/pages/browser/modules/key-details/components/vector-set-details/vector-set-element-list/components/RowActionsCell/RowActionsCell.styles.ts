import styled from 'styled-components'

import { TextButton } from 'uiSrc/components/base/forms/buttons'

export const ActionTextButton = styled(TextButton)`
  margin-top: ${({ theme }) => theme.core.space.space025};
  color: ${({ theme }) => theme.semantic.color.text.informative400};
`
