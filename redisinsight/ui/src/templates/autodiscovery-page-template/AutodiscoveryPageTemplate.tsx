import React from 'react'
import { PageHeader } from 'uiSrc/components'
import ExplorePanelTemplate from 'uiSrc/templates/explore-panel/ExplorePanelTemplate'

import { Page, PageBody } from 'uiSrc/components/base/layout/page'
import styles from './styles.module.scss'
import { Spacer } from 'uiSrc/components/base/layout'
import { Col } from 'uiSrc/components/base/layout/flex'

export interface Props {
  children: React.ReactNode
}

const AutodiscoveryPageTemplate = (props: Props) => {
  const { children } = props
  return (
    <>
      <PageHeader title="Redis databases" showInsights />
      <Spacer size="s" />
      <ExplorePanelTemplate panelClassName={styles.explorePanel}>
        <Page className={styles.page}>
          <PageBody component="div">
            <Col>{children}</Col>
          </PageBody>
        </Page>
      </ExplorePanelTemplate>
    </>
  )
}

export default AutodiscoveryPageTemplate
