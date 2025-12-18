import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import {
  setStreamViewType,
  selectedGroupSelector,
  setSelectedConsumer,
  fetchConsumerMessages,
  deleteConsumersAction,
} from 'uiSrc/slices/browser/stream'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import {
  TableCellAlignment,
  TableCellTextAlignment,
  TEXT_CONSUMER_GROUP_NAME_TOO_LONG,
} from 'uiSrc/constants'
import { StreamViewType } from 'uiSrc/slices/interfaces/stream'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import {
  selectedKeyDataSelector,
  updateSelectedKeyRefreshTime,
} from 'uiSrc/slices/browser/keys'
import { formatLongName, isTruncatedString } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { Text } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components'
import { ConsumerDto } from 'apiSrc/modules/browser/stream/dto'
import ConsumersView from './ConsumersView'

import styles from './ConsumersView/styles.module.scss'

const suffix = '_stream_consumer'
const actionsWidth = 50

export interface Props {}

const ConsumersViewWrapper = (props: Props) => {
  const { name: key = '' } = useSelector(selectedKeyDataSelector) ?? {
    name: '',
  }
  const {
    name: selectedGroupName = '',
    nameString: selectedGroupNameString = '',
    lastRefreshTime,
    data: loadedConsumers = [],
  } = useSelector(selectedGroupSelector) ?? {}

  const isTruncatedGroupName = isTruncatedString(selectedGroupName)

  const { instanceId } = useParams<{ instanceId: string }>()

  const dispatch = useDispatch()

  const [deleting, setDeleting] = useState<string>('')

  useEffect(() => {
    dispatch(updateSelectedKeyRefreshTime(lastRefreshTime))
  }, [])

  const closePopover = () => {
    setDeleting('')
  }

  const showPopover = (consumer = '') => {
    setDeleting(`${consumer + suffix}`)
  }

  const onSuccessDeletedConsumer = () => {
    sendEventTelemetry({
      event: TelemetryEvent.STREAM_CONSUMER_DELETED,
      eventData: {
        databaseId: instanceId,
      },
    })
    closePopover()
  }

  const handleDeleteConsumer = (consumerName = '') => {
    dispatch(
      deleteConsumersAction(
        key,
        selectedGroupName,
        [consumerName],
        onSuccessDeletedConsumer,
      ),
    )
  }

  const handleRemoveIconClick = () => {
    // sendEventTelemetry({
    //   event: getBasedOnViewTypeEvent(
    //     viewType,
    //     TelemetryEvent.BROWSER_KEY_VALUE_REMOVE_CLICKED,
    //     TelemetryEvent.TREE_VIEW_KEY_VALUE_REMOVE_CLICKED
    //   ),
    //   eventData: {
    //     databaseId: instanceId,
    //     keyType: KeyTypes.Stream
    //   }
    // })
  }

  const handleSelectConsumer = ({ rowData }: { rowData: any }) => {
    dispatch(setSelectedConsumer(rowData))
    dispatch(
      fetchConsumerMessages(false, () =>
        dispatch(setStreamViewType(StreamViewType.Messages)),
      ),
    )
  }

  const columns: ITableColumn[] = [
    {
      id: 'name',
      label: 'Consumer Name',
      minWidth: 200,
      truncateText: true,
      isSortable: true,
      headerClassName: 'streamItemHeader',
      headerCellClassName: 'truncateText',
      render: function Name(_name: string, { name }: ConsumerDto) {
        // Better to cut the long string, because it could affect virtual scroll performance
        const viewName = name?.viewValue ?? ''
        const cellContent = viewName.substring(0, 200)
        const tooltipContent = formatLongName(viewName)
        return (
          <Text style={{ maxWidth: '100%' }} color="secondary">
            <div
              style={{ display: 'flex' }}
              className="truncateText"
              data-testid={`stream-consumer-${viewName}`}
            >
              <RiTooltip
                className={styles.tooltipName}
                anchorClassName="truncateText"
                position="bottom"
                content={tooltipContent}
              >
                <>{cellContent}</>
              </RiTooltip>
            </div>
          </Text>
        )
      },
    },
    {
      id: 'pending',
      label: 'Pending',
      minWidth: 106,
      maxWidth: 106,
      absoluteWidth: 106,
      truncateText: true,
      isSortable: true,
      headerClassName: 'streamItemHeader',
      headerCellClassName: 'truncateText',
      render: (cellData: number) => <Text color="secondary">{cellData}</Text>,
    },
    {
      id: 'idle',
      label: 'Idle Time, msec',
      minWidth: 140,
      maxWidth: 140,
      absoluteWidth: 140,
      isSortable: true,
      alignment: TableCellAlignment.Right,
      className: styles.cell,
      headerClassName: 'streamItemHeader',
      headerCellClassName: 'truncateText',
      render: (cellData: number) => (
        <Text color="secondary">{numberWithSpaces(cellData)}</Text>
      ),
    },
    {
      id: 'actions',
      label: '',
      headerClassName: 'streamItemHeader',
      textAlignment: TableCellTextAlignment.Left,
      absoluteWidth: actionsWidth,
      maxWidth: actionsWidth,
      minWidth: actionsWidth,
      render: function Actions(_act: any, { name }: ConsumerDto) {
        const viewName = name?.viewValue ?? ''
        return (
          <div>
            <PopoverDelete
              header={viewName}
              text={
                <>
                  will be removed from Consumer Group{' '}
                  <b>{selectedGroupNameString}</b>
                </>
              }
              item={viewName}
              suffix={suffix}
              deleting={deleting}
              closePopover={closePopover}
              updateLoading={false}
              showPopover={showPopover}
              testid={`remove-consumer-button-${viewName}`}
              handleDeleteItem={() => handleDeleteConsumer(name)}
              handleButtonClick={handleRemoveIconClick}
            />
          </div>
        )
      },
    },
  ]

  return (
    <>
      <ConsumersView
        data={loadedConsumers}
        columns={columns}
        onClosePopover={closePopover}
        onSelectConsumer={handleSelectConsumer}
        {...props}
        noItemsMessageString={
          isTruncatedGroupName ? TEXT_CONSUMER_GROUP_NAME_TOO_LONG : undefined
        }
      />
    </>
  )
}

export default ConsumersViewWrapper
