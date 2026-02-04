import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { orderBy } from 'lodash'

import { streamGroupsSelector } from 'uiSrc/slices/browser/stream'
import VirtualTable from 'uiSrc/components/virtual-table/VirtualTable'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { SortOrder } from 'uiSrc/constants'
import { ConsumerDto } from 'apiSrc/modules/browser/stream/dto'

import * as S from './ConsumersView.styles'

const headerHeight = 60
const rowHeight = 54

export interface Props {
  data: ConsumerDto[]
  columns: ITableColumn[]
  onClosePopover: () => void
  onSelectConsumer: ({ rowData }: { rowData: any }) => void
  noItemsMessageString?: string
}

const ConsumersView = (props: Props) => {
  const {
    data = [],
    columns = [],
    onClosePopover,
    onSelectConsumer,
    noItemsMessageString = 'Your Consumer Group has no Consumers available.',
  } = props

  const { loading } = useSelector(streamGroupsSelector)
  const { name: key = '' } = useSelector(selectedKeyDataSelector) ?? {}

  const [consumers, setConsumers] = useState(data)
  const [sortedColumnName, setSortedColumnName] = useState<string>('name')
  const [sortedColumnOrder, setSortedColumnOrder] = useState<SortOrder>(
    SortOrder.ASC,
  )

  useEffect(() => {
    setConsumers(
      orderBy(data, sortedColumnName, sortedColumnOrder?.toLowerCase()),
    )
  }, [data])

  const onChangeSorting = (column: any, order: SortOrder) => {
    setSortedColumnName(column)
    setSortedColumnOrder(order)

    setConsumers(orderBy(consumers, column, order?.toLowerCase()))
  }

  return (
    <>
      <S.Container data-testid="stream-consumers-container">
        <VirtualTable
          autoHeight
          hideProgress
          onRowClick={onSelectConsumer}
          selectable={false}
          keyName={key}
          totalItemsCount={consumers.length}
          headerHeight={consumers?.length ? headerHeight : 0}
          rowHeight={rowHeight}
          columns={columns}
          footerHeight={0}
          loading={loading}
          items={consumers}
          onWheel={onClosePopover}
          onChangeSorting={onChangeSorting}
          noItemsMessage={noItemsMessageString}
          sortedColumn={
            consumers?.length
              ? {
                  column: sortedColumnName,
                  order: sortedColumnOrder,
                }
              : undefined
          }
        />
      </S.Container>
    </>
  )
}

export default ConsumersView
