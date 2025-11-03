import styled from 'styled-components'
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
