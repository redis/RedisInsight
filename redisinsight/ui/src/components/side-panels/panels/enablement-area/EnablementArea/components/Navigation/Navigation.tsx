import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { isArray } from 'lodash'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Group as ListGroup } from 'uiSrc/components/base/layout/list'
import {
  EnablementAreaComponent,
  IEnablementAreaItem,
} from 'uiSrc/slices/interfaces'

import {
  ApiEndpoints,
  EAItemActions,
  EAManifestFirstKey,
  FeatureFlags,
} from 'uiSrc/constants'
import {
  sendEventTelemetry,
  TELEMETRY_EMPTY_VALUE,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import {
  deleteCustomTutorial,
  setWbCustomTutorialsState,
  uploadCustomTutorial,
} from 'uiSrc/slices/workbench/wb-custom-tutorials'

import UploadWarning from 'uiSrc/components/upload-warning'
import {
  appFeatureFlagsFeaturesSelector,
  appFeatureOnboardingSelector,
} from 'uiSrc/slices/app/features'
import { OnboardingSteps } from 'uiSrc/constants/onboarding'
import { FormValues } from '../UploadTutorialForm/UploadTutorialForm'

import Group from '../Group'
import InternalLink from '../InternalLink'
import PlainText from '../PlainText'
import { Col } from 'uiSrc/components/base/layout/flex'
import UploadTutorialForm from '../UploadTutorialForm'

import styles from './styles.module.scss'

const padding = 16

export interface Props {
  tutorials: IEnablementAreaItem[]
  customTutorials: IEnablementAreaItem[]
  isInternalPageVisible: boolean
}

const CUSTOM_TUTORIALS_ID = 'custom-tutorials'

const PATHS = {
  guides: {
    sourcePath: ApiEndpoints.GUIDES_PATH,
    manifestPath: EAManifestFirstKey.GUIDES,
  },
  tutorials: {
    sourcePath: ApiEndpoints.TUTORIALS_PATH,
    manifestPath: EAManifestFirstKey.TUTORIALS,
  },
  customTutorials: {
    sourcePath: ApiEndpoints.CUSTOM_TUTORIALS_PATH,
    manifestPath: EAManifestFirstKey.CUSTOM_TUTORIALS,
  },
}

const Navigation = (props: Props) => {
  const { tutorials, customTutorials, isInternalPageVisible } = props
  const { currentStep, isActive } = useSelector(appFeatureOnboardingSelector)
  const { [FeatureFlags.envDependent]: envDependentFeature } = useSelector(
    appFeatureFlagsFeaturesSelector,
  )

  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const dispatch = useDispatch()
  const { instanceId = '' } = useParams<{ instanceId: string }>()

  const isCustomTutorialsOnboarding =
    currentStep === OnboardingSteps.CustomTutorials && isActive

  useEffect(
    () => () => {
      dispatch(setWbCustomTutorialsState())
    },
    [],
  )

  const submitCreate = ({ file, link }: FormValues) => {
    const formData = new FormData()

    if (file) {
      formData.append('file', file)
    } else {
      formData.append('link', link)
    }

    sendEventTelemetry({
      event: TelemetryEvent.EXPLORE_PANEL_IMPORT_SUBMITTED,
      eventData: {
        databaseId: instanceId || TELEMETRY_EMPTY_VALUE,
        source: file ? 'Upload' : 'URL',
      },
    })

    dispatch(
      uploadCustomTutorial(formData, () => {
        setIsCreateOpen(false)
        dispatch(setWbCustomTutorialsState(true))
      }),
    )
  }

  const onDeleteCustomTutorial = (id: string) => {
    dispatch(
      deleteCustomTutorial(id, () => {
        sendEventTelemetry({
          event: TelemetryEvent.EXPLORE_PANEL_TUTORIAL_DELETED,
          eventData: {
            databaseId: instanceId || TELEMETRY_EMPTY_VALUE,
          },
        })
      }),
    )
  }

  const renderSwitch = (
    item: IEnablementAreaItem,
    {
      sourcePath,
      manifestPath = '',
    }: { sourcePath: string; manifestPath?: string },
    level: number,
  ) => {
    const {
      label,
      type,
      children,
      id,
      args,
      _actions: actions,
      _path: uriPath,
      _key: key,
      summary,
    } = item

    const paddingsStyle = {
      paddingLeft: `${padding + level * 0}px`, // Note: Using the accordion component, we don't need to manually increase padding for nested items anymore
      paddingRight: `${padding}px`,
    }
    const currentSourcePath =
      sourcePath + (uriPath ? `${uriPath}` : (args?.path ?? ''))
    const currentManifestPath = `${manifestPath}/${key}`

    const isCustomTutorials = id === CUSTOM_TUTORIALS_ID && level === 0

    switch (type) {
      case EnablementAreaComponent.Group:
        return (
          <Group
            id={id}
            label={label}
            actions={actions}
            isShowFolder={level !== 0}
            isShowActions={currentSourcePath.startsWith(
              ApiEndpoints.CUSTOM_TUTORIALS_PATH,
            )}
            onCreate={() => setIsCreateOpen((v) => !v)}
            onDelete={onDeleteCustomTutorial}
            isPageOpened={isInternalPageVisible}
            forceState={
              isCustomTutorials && isCustomTutorialsOnboarding
                ? 'open'
                : undefined
            }
            {...args}
          >
            {isCustomTutorials &&
              actions?.includes(EAItemActions.Create) &&
              (children?.length === 0 ? (
                <Col gap="l">
                  <UploadTutorialForm onSubmit={submitCreate} />
                  <UploadWarning />
                </Col>
              ) : (
                isCreateOpen && (
                  <UploadTutorialForm
                    onSubmit={submitCreate}
                    onCancel={() => setIsCreateOpen(false)}
                  />
                )
              ))}
            {renderTreeView(
              children ? getManifestItems(children) : [],
              {
                sourcePath: currentSourcePath,
                manifestPath: currentManifestPath,
              },
              level + 1,
            )}
          </Group>
        )
      case EnablementAreaComponent.InternalLink:
        return (
          <InternalLink
            manifestPath={currentManifestPath}
            sourcePath={currentSourcePath}
            style={paddingsStyle}
            testId={id || label}
            label={label}
            summary={summary}
            path={args?.path}
          >
            {args?.content || label}
          </InternalLink>
        )
      default:
        return <PlainText style={paddingsStyle}>{label}</PlainText>
    }
  }

  const renderTreeView = (
    elements: IEnablementAreaItem[],
    paths: { sourcePath: string; manifestPath?: string },
    level: number = 0,
  ) =>
    elements?.map((item) => (
      <div className="fluid" key={`${item.id}_${item._key}`}>
        {renderSwitch(item, paths, level)}
      </div>
    ))

  return (
    <ListGroup
      style={{ padding: 5 }}
      gap="m"
      maxWidth="false"
      data-testid="enablementArea-treeView"
      flush
      className={cx(styles.innerContainer)}
    >
      {tutorials &&
        renderTreeView(getManifestItems(tutorials), PATHS.tutorials)}
      {customTutorials &&
        envDependentFeature?.flag &&
        renderTreeView(
          getManifestItems(customTutorials),
          PATHS.customTutorials,
        )}
    </ListGroup>
  )
}

export default Navigation

const getManifestItems = (manifest: IEnablementAreaItem[]) =>
  isArray(manifest)
    ? manifest.map((item, index) => ({ ...item, _key: `${index}` }))
    : []
