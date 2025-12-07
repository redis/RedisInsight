import React from 'react'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { DataStreamsData } from 'uiSrc/pages/rdi/statistics/data-streams/DataStreams.types'
import { FormatedDate } from 'uiSrc/components'

export const LastArrivalCell = ({
  getValue,
}: CellContext<DataStreamsData, unknown>) => (
  <FormatedDate date={getValue<string>()} />
)
