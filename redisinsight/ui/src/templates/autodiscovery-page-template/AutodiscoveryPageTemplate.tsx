import React from 'react'
import ExplorePanelTemplate from 'uiSrc/templates/explore-panel/ExplorePanelTemplate'

import { Page, PageBody } from 'uiSrc/components/base/layout/page'
import styles from './styles.module.scss'
import { Col } from 'uiSrc/components/base/layout/flex'

export interface Props {
  children: React.ReactNode
}

const AutodiscoveryPageTemplate = (props: Props) => {
  const { children } = props
  return (
    <>
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
