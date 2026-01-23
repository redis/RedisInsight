import styled from 'styled-components'
import { Page as BasePage } from 'uiSrc/components/base/layout/page'
import { Col } from 'uiSrc/components/base/layout/flex'

export const PageWrapper = styled(Col)`
  height: 100%;
  overflow: hidden;
`

export const Page = styled(BasePage)`
  height: 100%;
  padding: ${({ theme }) => theme.core.space.space200};
  padding-top: 1px;
`

export const HomePageContent = styled(Col)`
  height: calc(100% - 60px);
`
