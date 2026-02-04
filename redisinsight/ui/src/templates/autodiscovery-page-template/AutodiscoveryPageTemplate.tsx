import React from 'react'
import { PageHeader } from 'uiSrc/components'
import ExplorePanelTemplate from 'uiSrc/templates/explore-panel/ExplorePanelTemplate'

import { PageBody } from 'uiSrc/components/base/layout/page'
import { Spacer } from 'uiSrc/components/base/layout'
import { Col } from 'uiSrc/components/base/layout/flex'
import * as S from './AutodiscoveryPageTemplate.styles'

export interface Props {
  children: React.ReactNode
}

const AutodiscoveryPageTemplate = (props: Props) => {
  const { children } = props
  return (
    <>
      <PageHeader showInsights />
      <Spacer size="s" />
      <ExplorePanelTemplate>
        <S.StyledPage>
          <PageBody component="div">
            <Col>{children}</Col>
          </PageBody>
        </S.StyledPage>
      </ExplorePanelTemplate>
    </>
  )
}

export default AutodiscoveryPageTemplate
