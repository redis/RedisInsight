import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'

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
import { PageBody } from 'uiSrc/components/base/layout/page'
import { Rdi as RdiInstanceResponse } from 'apiSrc/modules/rdi/models/rdi'
import { dispatch } from 'uiSrc/slices/store'
import EmptyMessage from './empty-message/EmptyMessage'
import ConnectionForm from './connection-form/ConnectionFormWrapper'
import RdiHeader from './header/RdiHeader'
import RdiInstancesList from './components/rdi-instances-list/RdiInstancesList'
import {
  RdiPageDataProviderProvider,
  useRdiPageDataProvider,
} from './contexts/RdiPageDataProvider'

import * as S from './RdiPage.styles'

const handleOpenPage = (data: RdiInstance[]) => {
  sendPageViewTelemetry({
    name: TelemetryPageView.RDI_INSTANCES_PAGE,
    eventData: {
      instancesCount: data.length,
    },
  })
}

const RdiPage = () => {
  const {
    editInstance,
    setEditInstance,
    isConnectionFormOpen,
    setIsConnectionFormOpen,
  } = useRdiPageDataProvider()

  const { data, loading, loadingChanging } = useSelector(instancesSelector)
  const hideInstancesList = data.length === 0 && !loading && !loadingChanging

  useEffect(() => {
    dispatch(fetchInstancesAction(handleOpenPage))

    setTitle('Redis Data Integration')
  }, [])

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

  return (
    <HomePageTemplate>
      <S.RdiHomePage className="homePage">
        <PageBody component="div">
          <RdiHeader onRdiInstanceClick={handleOpenConnectionForm} />
          {hideInstancesList ? (
            <EmptyMessage onAddInstanceClick={handleOpenConnectionForm} />
          ) : (
            <RdiInstancesList />
          )}
          <ConnectionForm
            isOpen={isConnectionFormOpen}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseConnectionForm}
            editInstance={editInstance}
            isLoading={loading || loadingChanging}
          />
        </PageBody>
      </S.RdiHomePage>
    </HomePageTemplate>
  )
}

const RdiPageWithProvider = () => (
  <RdiPageDataProviderProvider>
    <RdiPage />
  </RdiPageDataProviderProvider>
)

export default RdiPageWithProvider
