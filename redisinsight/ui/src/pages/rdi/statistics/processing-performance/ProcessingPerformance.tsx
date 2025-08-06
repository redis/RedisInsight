import React from 'react'

import { RiCol, RiFlexItem, RiRow } from 'uiBase/layout'
import { IProcessingPerformance } from 'uiSrc/slices/interfaces'
import Accordion from '../components/accordion'
import Panel from '../components/panel'
import VerticalDivider from '../components/vertical-divider'

import styles from './styles.module.scss'

const InfoPanel = ({
  label,
  value,
  suffix,
}: {
  label: string
  value: number
  suffix: string
}) => (
  <RiFlexItem grow className={styles.infoPanel}>
    <RiRow gap="m" responsive>
      <RiFlexItem grow className={styles.infoLabel}>
        {label}
      </RiFlexItem>
      <RiFlexItem className={styles.infoValue}>{value}</RiFlexItem>
      <RiFlexItem className={styles.infoSuffix}>{suffix}</RiFlexItem>
    </RiRow>
  </RiFlexItem>
)

interface Props {
  data: IProcessingPerformance
  loading: boolean
  onRefresh: () => void
  onRefreshClicked: () => void
  onChangeAutoRefresh: (enableAutoRefresh: boolean, refreshRate: string) => void
}

const ProcessingPerformance = ({
  data: {
    totalBatches,
    batchSizeAvg,
    processTimeAvg,
    ackTimeAvg,
    recPerSecAvg,
    readTimeAvg,
    totalTimeAvg,
  },
  loading,
  onRefresh,
  onRefreshClicked,
  onChangeAutoRefresh,
}: Props) => (
  <Panel>
    <Accordion
      id="processing-performance-info"
      title="Processing performance information"
      loading={loading}
      onRefresh={onRefresh}
      onRefreshClicked={onRefreshClicked}
      onChangeAutoRefresh={onChangeAutoRefresh}
      enableAutoRefreshDefault
    >
      <>
        <RiRow responsive gap="s">
          <RiFlexItem grow>
            <RiCol gap="s">
              <InfoPanel
                label="Total batches"
                value={totalBatches}
                suffix="Total"
              />
              <InfoPanel
                label="Batch size average"
                value={batchSizeAvg}
                suffix="MB"
              />
              <InfoPanel
                label="Process time average"
                value={processTimeAvg}
                suffix="ms"
              />
            </RiCol>
          </RiFlexItem>
          <VerticalDivider />
          <RiFlexItem grow>
            <RiCol gap="s">
              <InfoPanel
                label="ACK time average"
                value={ackTimeAvg}
                suffix="sec"
              />
              <InfoPanel
                label="Records per second average"
                value={recPerSecAvg}
                suffix="/sec"
              />
              <InfoPanel
                label="Read time average"
                value={readTimeAvg}
                suffix="ms"
              />
            </RiCol>
          </RiFlexItem>
          <VerticalDivider />
          <RiFlexItem grow>
            <RiRow gap="s" align="start">
              <InfoPanel
                label="Total time average"
                value={totalTimeAvg}
                suffix="sec"
              />
            </RiRow>
          </RiFlexItem>
        </RiRow>
      </>
    </Accordion>
  </Panel>
)

export default ProcessingPerformance
