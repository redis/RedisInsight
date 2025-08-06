import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import cx from 'classnames'
import { RiPage, RiPageBody, Card } from 'uiBase/layout'
import { RIResizeObserver } from 'uiBase/utils'
import { RdiInstance } from 'uiSrc/slices/interfaces'
import {
  createInstanceAction,
  editInstanceAction,
  fetchInstancesAction,
  instancesSelector,
} from 'uiSrc/slices/rdi/instances'
import {
  sendEventTelemetry,
  sendPageViewTelemetry,
  TelemetryEvent,
  TelemetryPageView,
} from 'uiSrc/telemetry'
import HomePageTemplate from 'uiSrc/templates/home-page-template'
import { setTitle } from 'uiSrc/utils'
import { Rdi as RdiInstanceResponse } from 'apiSrc/modules/rdi/models/rdi'
import EmptyMessage from './empty-message/EmptyMessage'
import ConnectionForm from './connection-form/ConnectionFormWrapper'
import RdiHeader from './header/RdiHeader'
import RdiInstancesListWrapper from './instance-list/RdiInstancesListWrapper'

import styles from './styles.module.scss'

const RdiPage = () => {
  const [width, setWidth] = useState(0)
  const [isConnectionFormOpen, setIsConnectionFormOpen] = useState(false)
  const [editInstance, setEditInstance] = useState<RdiInstance | null>(null)

  const { data, loading, loadingChanging } = useSelector(instancesSelector)

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchInstancesAction(handleOpenPage))

    setTitle('Redis Data Integration')
  }, [])

  const handleOpenPage = (data: RdiInstance[]) => {
    sendPageViewTelemetry({
      name: TelemetryPageView.RDI_INSTANCES_PAGE,
      eventData: {
        instancesCount: data.length,
      },
    })
  }

  const onResize = ({ width: innerWidth }: { width: number }) => {
    setWidth(innerWidth)
  }

  const handleFormSubmit = (instance: Partial<RdiInstance>) => {
    const onSuccess = () => {
      setIsConnectionFormOpen(false)
      setEditInstance(null)
    }

    if (editInstance) {
      dispatch(editInstanceAction(editInstance.id, instance, onSuccess))
    } else {
      dispatch(
        createInstanceAction(
          { ...instance },
          (data: RdiInstanceResponse) => {
            sendEventTelemetry({
              event: TelemetryEvent.RDI_ENDPOINT_ADDED,
              eventData: {
                rdiId: data.id,
              },
            })
            onSuccess()
          },
          (error) => {
            sendEventTelemetry({
              event: TelemetryEvent.RDI_ENDPOINT_ADD_FAILED,
              eventData: {
                error,
              },
            })
          },
        ),
      )
    }

    sendEventTelemetry({
      event: TelemetryEvent.RDI_INSTANCE_SUBMITTED,
    })
  }

  const handleOpenConnectionForm = () => {
    setIsConnectionFormOpen(true)
    setEditInstance(null)
    sendEventTelemetry({
      event: TelemetryEvent.RDI_INSTANCE_ADD_CLICKED,
    })
  }

  const handleCloseConnectionForm = () => {
    setIsConnectionFormOpen(false)
    setEditInstance(null)
    sendEventTelemetry({
      event: TelemetryEvent.RDI_INSTANCE_ADD_CANCELLED,
    })
  }

  const handleEditInstance = (instance: RdiInstance) => {
    setEditInstance(instance)
    setIsConnectionFormOpen(true)
  }

  const handleDeleteInstance = () => {
    setEditInstance(null)
    setIsConnectionFormOpen(false)
  }

  const InstanceList = () =>
    !data.length ? (
      <>
        {!loading && !loadingChanging && (
          <EmptyMessage onAddInstanceClick={handleOpenConnectionForm} />
        )}
      </>
    ) : (
      <RIResizeObserver onResize={onResize}>
        {(resizeRef) => (
          <div
            data-testid="rdi-instance-list"
            className={styles.fullHeight}
            ref={resizeRef}
          >
            <RdiInstancesListWrapper
              width={width}
              editedInstance={editInstance}
              onEditInstance={handleEditInstance}
              onDeleteInstances={handleDeleteInstance}
            />
          </div>
        )}
      </RIResizeObserver>
    )

  return (
    <HomePageTemplate>
      <RiPage className={cx(styles.page, 'homePage')}>
        <RiPageBody component="div">
          <RdiHeader onRdiInstanceClick={handleOpenConnectionForm} />
          <InstanceList />
          <ConnectionForm
            isOpen={isConnectionFormOpen}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseConnectionForm}
            editInstance={editInstance}
            isLoading={loading || loadingChanging}
          />
        </RiPageBody>
      </RiPage>
    </HomePageTemplate>
  )
}

export default RdiPage
