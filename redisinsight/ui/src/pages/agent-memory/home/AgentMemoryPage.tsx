import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'

import { useAppSelector } from 'uiSrc/slices/hooks'
import { dispatch } from 'uiSrc/slices/store'
import {
  agentMemoryEndpointsSelector,
  connectEndpointAction,
  createEndpointAction,
  editEndpointAction,
  fetchEndpointsAction,
} from 'uiSrc/slices/agentMemory/endpoints'
import { AgentMemoryEndpoint } from 'uiSrc/slices/interfaces/agentMemory'
import { Pages } from 'uiSrc/constants'
import { setTitle, Nullable } from 'uiSrc/utils'
import HomePageTemplate from 'uiSrc/templates/home-page-template'
import { PageBody } from 'uiSrc/components/base/layout/page'
import { Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { PlusIcon } from 'uiSrc/components/base/icons'
import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'
import { Title } from 'uiSrc/components/base/text'

import EndpointsList from './components/endpoints-list/EndpointsList'
import EmptyMessage from './components/empty-message/EmptyMessage'
import EndpointConnectionFormWrapper from './components/connection-form/EndpointConnectionFormWrapper'
import * as S from './AgentMemoryPage.styles'

const PAGE_TITLE = 'Agent Memory'

const AgentMemoryPage = () => {
  const history = useHistory()
  const { data, loading, loadingChanging } = useAppSelector(
    agentMemoryEndpointsSelector,
  )

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editEndpoint, setEditEndpoint] =
    useState<Nullable<AgentMemoryEndpoint>>(null)

  const hideList = data.length === 0 && !loading && !loadingChanging

  useEffect(() => {
    dispatch(fetchEndpointsAction())
    setTitle(PAGE_TITLE)
  }, [])

  const handleOpenForm = () => {
    setEditEndpoint(null)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setEditEndpoint(null)
    setIsFormOpen(false)
  }

  const handleEdit = (endpoint: AgentMemoryEndpoint) => {
    setEditEndpoint(endpoint)
    setIsFormOpen(true)
  }

  const handleConnect = (endpoint: AgentMemoryEndpoint) => {
    dispatch(
      connectEndpointAction(endpoint.id, () =>
        history.push(Pages.agentMemoryWorkspace(endpoint.id)),
      ),
    )
  }

  const handleFormSubmit = (endpoint: Partial<AgentMemoryEndpoint>) => {
    if (editEndpoint) {
      dispatch(editEndpointAction(editEndpoint.id, endpoint, handleCloseForm))
    } else {
      dispatch(createEndpointAction(endpoint, handleCloseForm))
    }
  }

  return (
    <HomePageTemplate>
      <S.HomePage className="homePage">
        <PageBody component="div">
          <Row align="center" justify="between" grow={false}>
            <Row align="center" gap="m" grow={false}>
              <Title size="M">{PAGE_TITLE}</Title>
              <RiBadge
                label="Preview"
                variant="notice"
                data-testid="agent-memory-preview-badge"
              />
            </Row>
            {!hideList && (
              <PrimaryButton
                data-testid="agent-memory-add-endpoint-button"
                icon={PlusIcon}
                onClick={handleOpenForm}
              >
                Agent memory endpoint
              </PrimaryButton>
            )}
          </Row>
          <Spacer size="m" />
          {hideList ? (
            <EmptyMessage onAddClick={handleOpenForm} />
          ) : (
            <EndpointsList onEdit={handleEdit} onConnect={handleConnect} />
          )}
          <EndpointConnectionFormWrapper
            isOpen={isFormOpen}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseForm}
            editEndpoint={editEndpoint}
            isLoading={loading || loadingChanging}
          />
        </PageBody>
      </S.HomePage>
    </HomePageTemplate>
  )
}

export default AgentMemoryPage
