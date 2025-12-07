import styled from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'
import { Col } from 'uiSrc/components/base/layout/flex'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'

export const StyledSelect = styled(RiSelect)`
  border: none;
`

export const ContentWrapper = styled(Col).attrs({
  grow: true,
})`
  padding-top: ${({ theme }: { theme: Theme }) => theme.core.space.space200};
`
