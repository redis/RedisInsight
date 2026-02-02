import styled from 'styled-components'
import { Page } from 'uiSrc/components/base/layout/page'
import { CallOut } from 'uiSrc/components/base/display/call-out/CallOut'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { Col } from 'uiSrc/components/base/layout/flex'
import { RICollapsibleNavGroup } from 'uiSrc/components/base/display'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Container = styled(Page)`
  position: relative;
  height: 100%;
  overflow: auto;
  scrollbar-width: thin;
`

export const Cover = styled(Col).attrs({
  align: 'center',
  justify: 'center',
})`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 2;
  opacity: 0.8;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral200};
`

export const PageTitle = styled(Title)`
  padding-bottom: ${({ theme }: { theme: Theme }) => theme.core.space.space200};
  font-weight: 500;
  font-size: 24px;
  line-height: 29px;
`

export const Warning = styled(CallOut)`
  margin: ${({ theme }: { theme: Theme }) =>
    `${theme.core.space.space050} 0 ${theme.core.space.space300}`};
`

export const SmallText = styled(Text).attrs({
  size: 's',
})`
  font-size: 14px;
  line-height: 24px;
  letter-spacing: -0.14px;
`

export const Accordion = styled(RICollapsibleNavGroup)`
  margin-top: 0;

  .RI-collapsible-nav-group-content {
    padding: 24px 30px 12px;
  }
`

export const AccordionWithSubTitle = styled(Accordion)`
  .euiAccordion__triggerWrapper {
    padding: 8px 16px;
    height: 60px;
    max-height: 60px;
  }

  .euiCollapsibleNavGroup__title {
    height: auto;
  }
`
