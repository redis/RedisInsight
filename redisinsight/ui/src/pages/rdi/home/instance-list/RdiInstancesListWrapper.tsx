import {
  Criteria,
  EuiButtonIcon,
  EuiTableFieldDataColumnType,
  EuiText,
  EuiToolTip,
  PropertySort,
} from '@elastic/eui'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'

import cx from 'classnames'
import ItemList from 'uiSrc/components/item-list'
import { BrowserStorageItem, DEFAULT_SORT, Pages } from 'uiSrc/constants'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import { localStorageService } from 'uiSrc/services'
import { Instance, RdiInstance } from 'uiSrc/slices/interfaces'
import {
  deleteInstancesAction,
  checkConnectToRdiInstanceAction,
  instancesSelector,
} from 'uiSrc/slices/rdi/instances'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { Nullable, formatLongName, lastConnectionFormat } from 'uiSrc/utils'

import { setAppContextConnectedRdiInstanceId } from 'uiSrc/slices/app/context'
import styles from './styles.module.scss'

export interface Props {
  width: number
  editedInstance: Nullable<RdiInstance>
  onEditInstance: (instance: RdiInstance) => void
  onDeleteInstances: (instances: RdiInstance[]) => void
}

const suffix = '_rdi_instance'

const RdiInstancesListWrapper = ({
  width,
  onEditInstance,
  editedInstance,
  onDeleteInstances,
}: Props) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { search } = useLocation()

  const instances = useSelector(instancesSelector)
  const [deletingId, setDeletingId] = useState('')
  const isLoadingRef = useRef(false)

  const closePopover = () => {
    setDeletingId('')
  }

  const showPopover = (id: string) => {
    setDeletingId(`${id + suffix}`)
  }

  useEffect(() => {
    const editInstanceId = new URLSearchParams(search).get('editInstance')
    if (editInstanceId && !instances.loading) {
      const instance = instances.data.find(
        (item: RdiInstance) => item.id === editInstanceId,
      )
      if (instance) {
        handleClickEditInstance(instance)
      }
      setTimeout(() => {
        history.replace(Pages.home)
      }, 1000)
    }

    isLoadingRef.current = instances.loading
  }, [instances.loading, search])

  useEffect(() => {
    closePopover()
  }, [width])

  const handleCheckConnectToInstance = (id: string) => {
    sendEventTelemetry({
      event: TelemetryEvent.OPEN_RDI_CLICKED,
      eventData: {
        rdiId: id,
      },
    })
    dispatch(
      checkConnectToRdiInstanceAction(
        id,
        (id: string) => history.push(Pages.rdiPipeline(id)),
        () => dispatch(setAppContextConnectedRdiInstanceId('')),
      ),
    )
  }

  const handleCopy = (text = '', id: string) => {
    navigator.clipboard?.writeText(text)
    sendEventTelemetry({
      event: TelemetryEvent.RDI_INSTANCE_URL_COPIED,
      eventData: {
        id,
      },
    })
  }

  const handleClickDeleteInstance = (id: string) => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_INSTANCE_SINGLE_DELETE_CLICKED,
      eventData: {
        id,
      },
    })
    showPopover(id)
  }

  const handleClickEditInstance = (instance: RdiInstance) => {
    onEditInstance(instance)
  }

  const handleDeleteInstance = (instance: RdiInstance) => {
    dispatch(
      deleteInstancesAction([instance], () => onDeleteInstances([instance])),
    )
  }

  const handleDeleteInstances = (instances: RdiInstance[]) => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_INSTANCE_MULTIPLE_DELETE_CLICKED,
      eventData: {
        ids: instances.map((instance) => instance.id),
      },
    })
    dispatch(
      deleteInstancesAction(instances, () => onDeleteInstances(instances)),
    )
  }

  const getRowProps = (instance: Instance) => ({
    className: cx({
      'euiTableRow-isSelected': instance?.id === editedInstance?.id,
    }),
  })

  const columns: EuiTableFieldDataColumnType<RdiInstance>[] = [
    {
      field: 'name',
      className: 'column_name',
      name: 'RDI Alias',
      dataType: 'string',
      truncateText: true,
      'data-test-subj': 'rdi-alias-column',
      sortable: ({ name }) => name?.toLowerCase(),
      width: '30%',
      render: (_, { name, id }) => (
        <EuiText
          data-testid={`rdi-alias-${id}`}
          onClick={() => handleCheckConnectToInstance(id)}
        >
          {name}
        </EuiText>
      ),
    },
    {
      field: 'url',
      className: 'column_url',
      name: 'URL',
      width: '35%',
      dataType: 'string',
      truncateText: true,
      sortable: ({ url }) => url?.toLowerCase(),
      render: (name: string, { id }) => (
        <div className="url" data-testid="url">
          <EuiText className="copyUrlText">{name}</EuiText>
          <EuiToolTip
            position="right"
            content="Copy"
            anchorClassName="copyUrlTooltip"
          >
            <EuiButtonIcon
              iconType="copy"
              aria-label="Copy URL"
              className="copyUrlBtn"
              onClick={() => handleCopy(name, id)}
            />
          </EuiToolTip>
        </div>
      ),
    },
    {
      field: 'version',
      className: 'column_type',
      name: 'Version',
      dataType: 'string',
      sortable: true,
      width: '100px',
      'data-test-subj': 'rdi-instance-version-column',
    },
    {
      field: 'lastConnection',
      className: 'column_lastConnection',
      name: 'Last connection',
      dataType: 'date',
      align: 'right',
      width: '170px',
      'data-test-subj': 'rdi-instance-last-connection-column',
      sortable: ({ lastConnection }) =>
        lastConnection ? -new Date(`${lastConnection}`) : -Infinity,
      render: (date: Date) => lastConnectionFormat(date),
    },
    {
      field: 'controls',
      className: 'column_controls',
      width: '120px',
      name: '',
      render: (_act: any, instance: RdiInstance) => (
        <>
          <EuiButtonIcon
            iconType="pencil"
            className="editInstanceBtn"
            aria-label="Edit instance"
            data-testid={`edit-instance-${instance.id}`}
            onClick={() => handleClickEditInstance(instance)}
          />
          <PopoverDelete
            header={formatLongName(instance.name, 50, 10, '...')}
            text="will be removed from RedisInsight."
            item={instance.id}
            suffix={suffix}
            deleting={deletingId}
            closePopover={closePopover}
            updateLoading={false}
            showPopover={showPopover}
            handleDeleteItem={() => handleDeleteInstance(instance)}
            handleButtonClick={() => handleClickDeleteInstance(instance.id)}
            testid={`delete-instance-${instance.id}`}
          />
        </>
      ),
    },
  ]

  const onTableChange = ({ sort, page }: Criteria<RdiInstance>) => {
    // calls also with page changing
    if (sort && !page) {
      localStorageService.set(BrowserStorageItem.rdiInstancesSorting, sort)
      sendEventTelemetry({
        event: TelemetryEvent.RDI_INSTANCE_LIST_SORTED,
        eventData: sort,
      })
    }
  }

  const sort: PropertySort =
    localStorageService.get(BrowserStorageItem.rdiInstancesSorting) ??
    DEFAULT_SORT

  return (
    <div className={styles.container}>
      <ItemList<RdiInstance>
        width={width}
        columns={columns}
        onDelete={handleDeleteInstances}
        onWheel={closePopover}
        loading={instances.loading}
        data={instances.data}
        onTableChange={onTableChange}
        rowProps={getRowProps}
        sort={sort}
        hideExport
      />
    </div>
  )
}

export default RdiInstancesListWrapper
