import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Theme } from 'uiSrc/components/base/theme/types'

export const StyledAnalysisPageContainer = styled(Col)`
  overflow: auto;
  padding-inline: ${({ theme }: { theme: Theme }) => theme.core.space.space200};
`
