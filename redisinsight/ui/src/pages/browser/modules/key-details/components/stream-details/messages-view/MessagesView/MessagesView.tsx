import React from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'
import { useTranslation } from 'uiSrc/i18n'
import cx from 'classnames'

import { streamGroupsSelector } from 'uiSrc/slices/browser/stream'
import VirtualTable from 'uiSrc/components/virtual-table/VirtualTable'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { PendingEntryDto } from 'apiClient'

import styles from './styles.module.scss'

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
    noItemsMessageString,
  } = props
  const { t } = useTranslation()

  const { loading } = useAppSelector(streamGroupsSelector)
  const { name: key = '' } = useAppSelector(selectedKeyDataSelector) ?? {}

  return (
    <>
      <div
        className={cx(
          'key-details-table',
          'stream-details-table',
          styles.container,
        )}
        data-testid="stream-messages-container"
      >
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
          noItemsMessage={
            noItemsMessageString ?? t('browser.stream.messages.empty')
          }
        />
      </div>
    </>
  )
}

export default MessagesView
