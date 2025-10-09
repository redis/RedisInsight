import React from 'react'
import cx from 'classnames'
import { useSelector } from 'react-redux'
import { sidePanelsSelector } from 'uiSrc/slices/panels/sidePanels'
import SidePanels from 'uiSrc/components/side-panels'

import styles from './styles.module.scss'
import { Col, Row } from 'uiSrc/components/base/layout/flex'

export interface Props {
  children: React.ReactNode
  panelClassName?: string
}

const ExplorePanelTemplate = (props: Props) => {
  const { children, panelClassName } = props
  const { openedPanel } = useSelector(sidePanelsSelector)

  return (
    <Row full className={styles.mainWrapper}>
      <Col className={cx(styles.mainPanel, { insightsOpen: !!openedPanel })}>
        {children}
      </Col>
      <div
        className={cx(styles.insigtsWrapper, {
          [styles.insightsOpen]: !!openedPanel,
        })}
      >
        <SidePanels panelClassName={panelClassName} />
      </div>
    </Row>
  )
}

export default React.memo(ExplorePanelTemplate)
