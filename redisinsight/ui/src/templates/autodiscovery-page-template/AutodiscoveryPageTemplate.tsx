import React from 'react'
import { RiPage, RiPageBody } from 'uiBase/layout'
import { PageHeader } from 'uiSrc/components'
import ExplorePanelTemplate from 'uiSrc/templates/explore-panel/ExplorePanelTemplate'

import styles from './styles.module.scss'

export interface Props {
  children: React.ReactNode
}

const AutodiscoveryPageTemplate = (props: Props) => {
  const { children } = props
  return (
    <>
      <PageHeader title="Redis databases" showInsights />
      <div />
      <ExplorePanelTemplate panelClassName={styles.explorePanel}>
        <RiPage className={styles.page}>
          <RiPageBody component="div">
            <div className="homePage">{children}</div>
          </RiPageBody>
        </RiPage>
      </ExplorePanelTemplate>
    </>
  )
}

export default AutodiscoveryPageTemplate
