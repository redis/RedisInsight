import React from 'react'

import { IRdiPipelineStatus } from 'uiSrc/slices/interfaces'
import { RiFlexItem, RiRow } from 'uiSrc/components/base/layout'
import Panel from '../components/panel'
import VerticalDivider from '../components/vertical-divider'

import styles from './styles.module.scss'

const StatusItem = ({ label, value }: { label: string; value: string }) => (
  <RiFlexItem grow>
    <RiRow gap="m" responsive>
      <RiFlexItem grow className={styles.statusLabel}>
        <b>{label}</b>
      </RiFlexItem>
      <RiFlexItem grow className={styles.statusValue}>
        {value}
      </RiFlexItem>
    </RiRow>
  </RiFlexItem>
)

interface Props {
  data: IRdiPipelineStatus
}

const Status = ({ data }: Props) => (
  <Panel>
    <RiRow gap="m" responsive>
      <StatusItem label="Address" value={data.address} />
      <VerticalDivider />
      <StatusItem label="Run status" value={data.runStatus} />
      <VerticalDivider />
      <StatusItem label="Sync Mode" value={data.syncMode} />
    </RiRow>
  </Panel>
)

export default Status
