import React from 'react'

import { IDataStreams } from 'uiSrc/slices/interfaces'
import { Table } from 'uiSrc/components/base/layout/table'
import { Section } from 'uiSrc/components/base/display'
import {
  StyledRdiAnalyticsTable,
  StyledRdiStatisticsSectionBody,
} from 'uiSrc/pages/rdi/statistics/styles'
import { DataStreamsData } from './DataStreams.types'
import columns from './DataStreams.config'

interface Props {
  data: IDataStreams
}

const DataStreams = ({ data }: Props) => {
  const dataStreams: DataStreamsData[] = Object.keys(data?.streams || {}).map(
    (key) => {
      const dataStream = data.streams[key]
      return {
        name: key,
        ...dataStream,
      }
    },
  )

  const totalsRow: DataStreamsData = {
    name: 'Total',
    total: data?.totals?.total || 0,
    pending: data?.totals?.pending || 0,
    inserted: data?.totals?.inserted || 0,
    updated: data?.totals?.updated || 0,
    deleted: data?.totals?.deleted || 0,
    filtered: data?.totals?.filtered || 0,
    rejected: data?.totals?.rejected || 0,
    deduplicated: data?.totals?.deduplicated || 0,
    lastArrival: '',
  }

  return (
    <Section.Compose collapsible defaultOpen id="data-streams">
      <Section.Header.Compose>
        <Section.Header.Label label="Data streams overview" />
        <Section.Header.CollapseButton />
      </Section.Header.Compose>
      <StyledRdiStatisticsSectionBody>
        <StyledRdiAnalyticsTable
          columns={columns}
          data={[...dataStreams, totalsRow]}
          defaultSorting={[{ id: 'name', desc: false }]}
        >
          <Table.Header />
          <Table.Body />
        </StyledRdiAnalyticsTable>
      </StyledRdiStatisticsSectionBody>
    </Section.Compose>
  )
}

export default DataStreams
