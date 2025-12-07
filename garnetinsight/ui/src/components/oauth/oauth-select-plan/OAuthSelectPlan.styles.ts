import styled from 'styled-components'
import { BoxSelectionGroup } from '@redis-ui/components'

import { FlexGroup } from 'uiSrc/components/base/layout/flex'
import { ColorText, Text } from 'uiSrc/components/base/text'

export const StyledModalContentBody = styled.section`
  width: 575px !important;
  min-width: 575px !important;
  padding: 16px;
  text-align: center;
`

export const StyledSubTitle = styled(Text)`
  padding: 0 40px;
`

export const StyledProvidersSection = styled(FlexGroup)`
  width: 100%;
  padding: 30px 45px 22px;
`

export const StyledProvidersSelectionGroup = styled(BoxSelectionGroup)`
  min-height: 68px;

  svg {
    width: 28px;
    height: initial;
  }

  p {
    font-size: 1.2rem;
  }
`

export const StyledRegion = styled.section`
  padding: 2px 45px;
  text-align: left;
`

export const StyledRegionName = styled(ColorText)`
  padding-left: 4px;
`

export const StyledRegionSelectDescription = styled(Text)`
  padding-top: 10px;
`

export const StyledFooter = styled.footer`
  width: 100%;
  padding: 32px 46px 0 46px;
`
