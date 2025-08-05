import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { lastDeliveredIDTooltipText } from 'uiSrc/constants/texts'
import {
  selectedKeyDataSelector,
  setSelectedKeyRefreshDisabled,
  updateSelectedKeyRefreshTime,
} from 'uiSrc/slices/browser/keys'

import {
  streamGroupsSelector,
  setSelectedGroup,
  fetchConsumers,
  setStreamViewType,
  modifyLastDeliveredIdAction,
  deleteConsumerGroupsAction,
} from 'uiSrc/slices/browser/stream'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import {
  bufferToString,
  consumerGroupIdRegex,
  formatLongName,
  isTruncatedString,
  isEqualBuffers,
  validateConsumerGroupId,
} from 'uiSrc/utils'
import { TableCellTextAlignment } from 'uiSrc/constants'
import { StreamViewType } from 'uiSrc/slices/interfaces/stream'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import EditablePopover from 'uiSrc/pages/browser/modules/key-details/shared/editable-popover'

import { FormatedDate, RiTooltip } from 'uiSrc/components'
import { Text } from 'uiSrc/components/base/text'
import { RiFormField } from 'uiSrc/components/base/forms'
import { RiIcon } from 'uiSrc/components/base/icons'
import { TextInput } from 'uiSrc/components/base/inputs'
import {
  ConsumerDto,
  ConsumerGroupDto,
  UpdateConsumerGroupDto,
} from 'apiSrc/modules/browser/stream/dto'

import GroupsView from './GroupsView'

import styles from './GroupsView/styles.module.scss'

export interface IConsumerGroup extends ConsumerGroupDto {
  editing: boolean
}

const suffix = '_stream_group'
const actionsWidth = 48

export interface Props {}

const GroupsViewWrapper = (props: Props) => {
  const {
    lastRefreshTime,
    data: loadedGroups = [],
    loading,
  } = useSelector(streamGroupsSelector)
  const { name: selectedKey, nameString: selectedKeyString } = useSelector(
    selectedKeyDataSelector,
  ) ?? { name: '', nameString: '' }

  const dispatch = useDispatch()

  const [groups, setGroups] = useState<IConsumerGroup[]>([])
  const [deleting, setDeleting] = useState<string>('')
  const [editValue, setEditValue] = useState<string>('')
  const [idError, setIdError] = useState<string>('')
  const [isIdFocused, setIsIdFocused] = useState<boolean>(false)

  const { instanceId } = useParams<{ instanceId: string }>()

  useEffect(() => {
    dispatch(updateSelectedKeyRefreshTime(lastRefreshTime))
  }, [lastRefreshTime])

  useEffect(() => {
    const streamItem: IConsumerGroup[] = loadedGroups?.map((item) =>
      formatItem(item),
    )

    setGroups(streamItem)
  }, [loadedGroups, deleting])

  useEffect(() => {
    if (!consumerGroupIdRegex.test(editValue)) {
      setIdError('ID format is not correct')
      return
    }
    setIdError('')
  }, [editValue])

  const formatItem = useCallback(
    (item: ConsumerGroupDto): IConsumerGroup => ({
      ...item,
      editing: false,
      name: {
        ...item.name,
        viewValue: bufferToString(item.name),
      },
      greatestPendingId: {
        ...item.greatestPendingId,
        viewValue: bufferToString(item.greatestPendingId),
      },
      smallestPendingId: {
        ...item.smallestPendingId,
        viewValue: bufferToString(item.smallestPendingId),
      },
    }),
    [],
  )

  const closePopover = () => {
    setDeleting('')
  }

  const showPopover = (groupName = '') => {
    setDeleting(`${groupName + suffix}`)
  }

  const onSuccessDeletedGroup = () => {
    sendEventTelemetry({
      event: TelemetryEvent.STREAM_CONSUMER_GROUP_DELETED,
      eventData: {
        databaseId: instanceId,
      },
    })
    closePopover()
  }

  const handleDeleteGroup = (name: RedisResponseBuffer) => {
    dispatch(
      deleteConsumerGroupsAction(selectedKey, [name], onSuccessDeletedGroup),
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

  const onSuccessSelectedGroup = (data: ConsumerDto[]) => {
    dispatch(setStreamViewType(StreamViewType.Consumers))
    sendEventTelemetry({
      event: TelemetryEvent.STREAM_CONSUMERS_LOADED,
      eventData: {
        databaseId: instanceId,
        length: data.length,
      },
    })
  }

  const onSuccessApplyEditId = () => {
    sendEventTelemetry({
      event: TelemetryEvent.STREAM_CONSUMER_GROUP_ID_SET,
      eventData: {
        databaseId: instanceId,
      },
    })
  }

  const handleSelectGroup = ({ rowData }: { rowData: any }) => {
    dispatch(setSelectedGroup(rowData))

    if (!isTruncatedString(rowData?.name)) {
      dispatch(fetchConsumers(false, onSuccessSelectedGroup))
    } else {
      onSuccessSelectedGroup([])
    }
  }

  const handleApplyEditId = (groupName: RedisResponseBuffer) => {
    if (!!groupName?.data?.length && !idError && selectedKey) {
      const data: UpdateConsumerGroupDto = {
        keyName: selectedKey,
        name: groupName,
        lastDeliveredId: editValue,
      }
      dispatch(modifyLastDeliveredIdAction(data, onSuccessApplyEditId))
    }
  }

  const handleEditId = (name: RedisResponseBuffer, lastDeliveredId: string) => {
    const newGroupsState: IConsumerGroup[] = groups?.map((item) =>
      isEqualBuffers(item.name, name) ? { ...item, editing: true } : item,
    )

    setGroups(newGroupsState)
    setEditValue(lastDeliveredId)
    dispatch(setSelectedKeyRefreshDisabled(true))
  }

  const columns: ITableColumn[] = [
    {
      id: 'name',
      label: 'Group Name',
      truncateText: true,
      isSortable: true,
      minWidth: 100,
      headerClassName: 'streamItemHeader',
      headerCellClassName: 'truncateText',
      render: function Name(_name: string, { name }: IConsumerGroup) {
        const viewName = name?.viewValue ?? ''
        // Better to cut the long string, because it could affect virtual scroll performance
        const cellContent = viewName.substring(0, 200)
        const tooltipContent = formatLongName(viewName)
        return (
          <Text color="subdued" size="s" style={{ maxWidth: '100%' }}>
            <div
              style={{ display: 'flex' }}
              className="truncateText"
              data-testid={`stream-group-name-${viewName}`}
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
      id: 'consumers',
      label: 'Consumers',
      minWidth: 120,
      maxWidth: 120,
      absoluteWidth: 120,
      truncateText: true,
      isSortable: true,
      headerClassName: 'streamItemHeader',
      headerCellClassName: 'truncateText',
    },
    {
      id: 'pending',
      label: 'Pending',
      minWidth: 95,
      maxWidth: 95,
      absoluteWidth: 95,
      isSortable: true,
      className: styles.cell,
      headerClassName: 'streamItemHeader',
      headerCellClassName: 'truncateText',
      render: function P(
        _name: string,
        { pending, greatestPendingId, smallestPendingId, name }: IConsumerGroup,
      ) {
        const viewName = name?.viewValue ?? ''
        const smallestTimestamp = smallestPendingId?.viewValue?.split('-')?.[0]
        const greatestTimestamp = greatestPendingId?.viewValue?.split('-')?.[0]

        const tooltipContent = (
          <>
            <FormatedDate date={smallestTimestamp} />
            <span>&nbsp;–&nbsp;</span>
            <FormatedDate date={greatestTimestamp} />
          </>
        )

        return (
          <Text size="s" style={{ maxWidth: '100%' }}>
            <div
              style={{ display: 'flex' }}
              className="truncateText"
              data-testid={`group-pending-${viewName}`}
            >
              {!!pending && (
                <RiTooltip
                  title={`${pending} Pending Messages`}
                  className={styles.tooltip}
                  anchorClassName="truncateText"
                  position="bottom"
                  content={tooltipContent}
                >
                  <>{pending}</>
                </RiTooltip>
              )}
              {!pending && pending}
            </div>
          </Text>
        )
      },
    },
    {
      id: 'lastDeliveredId',
      label: 'Last Delivered ID',
      minWidth: 200,
      maxWidth: 200,
      absoluteWidth: 200,
      isSortable: true,
      className: cx(styles.cell, 'noPadding'),
      headerClassName: 'streamItemHeader',
      headerCellClassName: 'truncateText',
      render: function Id(
        _name: string,
        { lastDeliveredId: id, name, editing }: IConsumerGroup,
      ) {
        const timestamp = id?.split('-')?.[0]
        const showIdError = !isIdFocused && idError
        const isTruncatedGroupName = isTruncatedString(name)

        return (
          <EditablePopover
            content={
              <div className={styles.editableCell}>
                <Text
                  color="subdued"
                  size="s"
                  style={{ maxWidth: '100%' }}
                  component="div"
                >
                  <div
                    className="truncateText streamItem"
                    style={{ display: 'flex', maxWidth: '190px' }}
                    data-testid={`stream-group-date-${id}`}
                  >
                    <FormatedDate date={timestamp} />
                  </div>
                </Text>
                <Text size="s" style={{ maxWidth: '100%' }} component="div">
                  <div
                    className="streamItemId"
                    data-testid={`stream-group-id-${id}`}
                  >
                    {id}
                  </div>
                </Text>
              </div>
            }
            field={id}
            prefix="stream-group"
            isOpen={editing}
            onOpen={() => handleEditId(name, id)}
            onDecline={() => dispatch(setSelectedKeyRefreshDisabled(false))}
            onApply={() => {
              handleApplyEditId(name)
              dispatch(setSelectedKeyRefreshDisabled(false))
            }}
            className={styles.editLastId}
            isDisabled={!editValue.length || !!idError}
            isDisabledEditButton={isTruncatedGroupName}
            isLoading={loading}
            delay={500}
            editBtnClassName={styles.editBtn}
          >
            <RiFormField
              additionalText={
                <RiTooltip
                  anchorClassName="inputAppendIcon"
                  position="left"
                  title="Enter Valid ID, 0 or $"
                  content={lastDeliveredIDTooltipText}
                >
                  <RiIcon type="InfoIcon" style={{ cursor: 'pointer' }} />
                </RiTooltip>
              }
            >
              <TextInput
                name="id"
                id="id"
                placeholder="ID*"
                value={editValue}
                onChange={(value) =>
                  setEditValue(validateConsumerGroupId(value))
                }
                onBlur={() => setIsIdFocused(false)}
                onFocus={() => setIsIdFocused(true)}
                style={{ width: 240 }}
                autoComplete="off"
                data-testid="last-id-field"
              />
              {!showIdError && (
                <span className={styles.idText} data-testid="id-help-text">
                  Timestamp - Sequence Number or $
                </span>
              )}
              {showIdError && (
                <span className={styles.error} data-testid="id-error">
                  {idError}
                </span>
              )}
            </RiFormField>
          </EditablePopover>
        )
      },
    },
    {
      id: 'actions',
      label: '',
      headerClassName: styles.actionsHeader,
      textAlignment: TableCellTextAlignment.Left,
      absoluteWidth: actionsWidth,
      maxWidth: actionsWidth,
      minWidth: actionsWidth,
      render: function Actions(_act: any, { name }: IConsumerGroup) {
        const viewName = name?.viewValue ?? ''
        return (
          <div>
            <PopoverDelete
              header={viewName}
              text={
                <>
                  and all its consumers will be removed from{' '}
                  <b>{selectedKeyString}</b>
                </>
              }
              item={viewName}
              suffix={suffix}
              deleting={deleting}
              closePopover={closePopover}
              updateLoading={false}
              showPopover={showPopover}
              testid={`remove-groups-button-${viewName}`}
              handleDeleteItem={() => handleDeleteGroup(name)}
              handleButtonClick={handleRemoveIconClick}
            />
          </div>
        )
      },
    },
  ]

  return (
    <>
      <GroupsView
        data={groups}
        columns={columns}
        onClosePopover={closePopover}
        onSelectGroup={handleSelectGroup}
        {...props}
      />
    </>
  )
}

export default GroupsViewWrapper
