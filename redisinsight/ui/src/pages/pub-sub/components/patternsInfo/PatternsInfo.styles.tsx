import styled from 'styled-components'
import { RiIcon } from 'uiSrc/components/base/icons'

export const InfoIcon = styled(RiIcon).attrs({
  type: 'InfoIcon',
  'data-testid': 'append-info-icon',
})`
  cursor: pointer;
  // TODO: Remove margin-top
  // Hack: for some reason this icon has extra height, which breaks flex alignment
  margin-top: 4px;
`
