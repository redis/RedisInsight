import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { checkConnectToRdiInstanceAction } from 'uiSrc/slices/rdi/instances'
import {
  checkConnectToInstanceAction,
  setConnectedInstanceId,
} from 'uiSrc/slices/instances/instances'
import { Pages } from 'uiSrc/constants'
import { Instance, RdiInstance } from 'uiSrc/slices/interfaces'
import {
  TelemetryEvent,
  getRedisModulesSummary,
  sendEventTelemetry,
  getRedisInfoSummary,
} from 'uiSrc/telemetry'
import { getDbIndex } from 'uiSrc/utils'
import {
  Group as ListGroup,
  Item as ListGroupItem,
} from 'uiSrc/components/base/layout/list'
import { Text } from 'uiSrc/components/base/text'
import { Loader } from 'uiSrc/components/base/display'
import { InstancesTabs } from '../../InstancesNavigationPopover'
import * as S from '../../../../InstanceHeader.styles'

export interface InstancesListProps {
  selectedTab: InstancesTabs
  filteredDbInstances: Instance[]
  filteredRdiInstances: RdiInstance[]
  onItemClick: () => void
}

const InstancesList = ({
  selectedTab,
  filteredDbInstances,
  filteredRdiInstances,
  onItemClick,
}: InstancesListProps) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [selected, setSelected] = useState<string>('')

  const { instanceId, rdiInstanceId } = useParams<{
    instanceId: string
    rdiInstanceId: string
  }>()
  const history = useHistory()
  const dispatch = useDispatch()
  const instances =
    selectedTab === InstancesTabs.Databases
      ? filteredDbInstances
      : filteredRdiInstances

  const connectToInstance = (id = '') => {
    dispatch(setConnectedInstanceId(id))
    setLoading(false)
    onItemClick?.()
    history.push(Pages.browser(id))
  }

  const goToInstance = async (instance: Instance) => {
    if (instanceId === instance.id) {
      // already connected so do nothing
      return
    }
    setLoading(true)
    const modulesSummary = getRedisModulesSummary(instance.modules)
    const infoData = await getRedisInfoSummary(instance.id)
    await sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_OPEN_DATABASE,
      eventData: {
        databaseId: instance.id,
        source: 'navigation_panel',
        provider: instance.provider,
        ...modulesSummary,
        ...infoData,
      },
    })
    dispatch(
      checkConnectToInstanceAction(
        instance.id,
        connectToInstance,
        () => setLoading(false),
        false,
      ),
    )
  }

  const goToRdiInstance = (instance: RdiInstance) => {
    if (rdiInstanceId === instance.id) {
      // already connected so do nothing
      return
    }
    setLoading(true)
    dispatch(
      checkConnectToRdiInstanceAction(
        instance.id,
        (id: string) => {
          setLoading(false)
          onItemClick?.()
          history.push(Pages.rdiPipelineConfig(id))
        },
        () => setLoading(false),
      ),
    )
  }

  const goToPage = (instance: Instance | RdiInstance) => {
    if (selectedTab === InstancesTabs.Databases) {
      goToInstance(instance as Instance)
    } else {
      goToRdiInstance(instance as RdiInstance)
    }
  }

  const isInstanceActive = (id: string) => {
    if (selectedTab === InstancesTabs.Databases) {
      return id === instanceId
    }
    return id === rdiInstanceId
  }

  if (!instances?.length) {
    const emptyMsg =
      selectedTab === InstancesTabs.Databases
        ? 'No databases'
        : 'No RDI endpoints'
    return <S.EmptyMsg>{emptyMsg}</S.EmptyMsg>
  }

  return (
    <S.ListContainer>
      <ListGroup flush maxWidth="none" gap="none">
        {instances?.map((instance) => (
          <S.Item key={instance.id}>
            <ListGroupItem
              color="subdued"
              isActive={isInstanceActive(instance.id)}
              isDisabled={loading}
              label={
                <Text
                  style={{ display: 'flex', alignItems: 'center' }}
                  component="div"
                >
                  {loading && instance?.id === selected && (
                    <S.Loading>
                      <Loader size="s" />
                    </S.Loading>
                  )}
                  {instance.name} {getDbIndex(instance.db)}
                </Text>
              }
              onClick={() => {
                setSelected(instance.id)
                goToPage(instance)
              }}
              data-testid={`instance-item-${instance.id}`}
            />
          </S.Item>
        ))}
      </ListGroup>
    </S.ListContainer>
  )
}

export default InstancesList
