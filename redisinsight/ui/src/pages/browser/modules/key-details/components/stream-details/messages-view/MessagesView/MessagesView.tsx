import React from 'react'
import { useSelector } from 'react-redux'

import { streamGroupsSelector } from 'uiSrc/slices/browser/stream'
import VirtualTable from 'uiSrc/components/virtual-table/VirtualTable'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { PendingEntryDto } from 'apiSrc/modules/browser/stream/dto'

import * as S from './MessagesView.styles'

const headerHeight = 60
const rowHeight = 54

export interface Props {
  data: PendingEntryDto[]
  columns: ITableColumn[]
  total: number
  onClosePopover: () => void
  loadMoreItems: () => void
  noItemsMessageString?: string
}

const MessagesView = (props: Props) => {
  const {
    data = [],
    columns = [],
    total,
    onClosePopover,
    loadMoreItems,
    noItemsMessageString = 'Your Consumer has no pending messages.',
  } = props

  const { loading } = useSelector(streamGroupsSelector)
  const { name: key = '' } = useSelector(selectedKeyDataSelector) ?? {}

  return (
    <>
      <S.Container data-testid="stream-messages-container">
        <VirtualTable
          autoHeight
          hideProgress
          selectable={false}
          keyName={key}
          totalItemsCount={total}
          headerHeight={data?.length ? headerHeight : 0}
          rowHeight={rowHeight}
          columns={columns}
          footerHeight={0}
          loading={loading}
          items={data}
          tableWidth={columns.reduce((a, b) => a + (b.minWidth ?? 0), 0)}
          onWheel={onClosePopover}
          loadMoreItems={loadMoreItems}
          noItemsMessage={noItemsMessageString}
        />
      </S.Container>
    </>
  )
}

export default MessagesView
