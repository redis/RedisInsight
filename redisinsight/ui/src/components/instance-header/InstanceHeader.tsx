import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { FeatureFlags, Pages } from 'uiSrc/constants'
import { selectOnFocus } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { BuildType } from 'uiSrc/constants/env'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import {
  checkDatabaseIndexAction,
  connectedInstanceInfoSelector,
  connectedInstanceOverviewSelector,
  connectedInstanceSelector,
} from 'uiSrc/slices/instances/instances'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import {
  appContextDbIndex,
  clearBrowserKeyListData,
  setBrowserSelectedKey,
} from 'uiSrc/slices/app/context'

import {
  DatabaseOverview,
  FeatureFlagComponent,
  RiTooltip,
} from 'uiSrc/components'
import InlineItemEditor from 'uiSrc/components/inline-item-editor'
import { CopilotTrigger, InsightsTrigger } from 'uiSrc/components/triggers'
import ShortInstanceInfo from 'uiSrc/components/instance-header/components/ShortInstanceInfo'

import { resetKeyInfo } from 'uiSrc/slices/browser/keys'

import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { isAnyFeatureEnabled } from 'uiSrc/utils/features'
import { getConfig } from 'uiSrc/config'
import { appReturnUrlSelector } from 'uiSrc/slices/app/url-handling'
import UserProfile from 'uiSrc/components/instance-header/components/user-profile/UserProfile'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { EditIcon } from 'uiSrc/components/base/icons'
import { NumericInput } from 'uiSrc/components/base/inputs'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { Link } from 'uiSrc/components/base/link/Link'
import InstancesNavigationPopover from './components/instances-navigation-popover'
import * as S from './InstanceHeader.styles'
import { ColorText } from 'uiSrc/components/base/text'

const riConfig = getConfig()
const { returnUrlBase, returnUrlLabel, returnUrlTooltip } = riConfig.app

export interface Props {
  onChangeDbIndex?: (index: number) => void
}

const InstanceHeader = ({ onChangeDbIndex }: Props) => {
  const {
    name = '',
    host = '',
    port = '',
    username,
    connectionType = ConnectionType.Standalone,
    db = 0,
    id,
    loading: instanceLoading,
    modules = [],
  } = useSelector(connectedInstanceSelector)
  const { version } = useSelector(connectedInstanceOverviewSelector)
  const { server } = useSelector(appInfoSelector)
  const { disabled: isDbIndexDisabled } = useSelector(appContextDbIndex)
  const { databases = 0 } = useSelector(connectedInstanceInfoSelector)
  const returnUrl = useSelector(appReturnUrlSelector)
  const {
    [FeatureFlags.databaseChat]: databaseChatFeature,
    [FeatureFlags.documentationChat]: documentationChatFeature,
    [FeatureFlags.envDependent]: envDependentFeature,
  } = useSelector(appFeatureFlagsFeaturesSelector)
  const isAnyChatAvailable = isAnyFeatureEnabled([
    databaseChatFeature,
    documentationChatFeature,
  ])

  const history = useHistory()
  const [dbIndex, setDbIndex] = useState<string>(String(db || 0))
  const [isDbIndexEditing, setIsDbIndexEditing] = useState<boolean>(false)

  const dispatch = useDispatch()

  useEffect(() => {
    setDbIndex(String(db || 0))
  }, [db])

  const isRedisStack = server?.buildType === BuildType.RedisStack

  const goHome = () => {
    history.push(Pages.home)
  }

  const goToReturnUrl = () => {
    document.location = `${returnUrlBase}${returnUrl}`
  }

  const handleChangeDbIndex = () => {
    setIsDbIndexEditing(false)

    if (db === +dbIndex) return

    dispatch(
      checkDatabaseIndexAction(
        id,
        +dbIndex,
        () => {
          dispatch(clearBrowserKeyListData())
          onChangeDbIndex?.(+dbIndex)
          dispatch(resetKeyInfo())
          dispatch(setBrowserSelectedKey(null))

          sendEventTelemetry({
            event: TelemetryEvent.BROWSER_DATABASE_INDEX_CHANGED,
            eventData: {
              databaseId: id,
              prevIndex: db,
              nextIndex: +dbIndex,
            },
          })
        },
        () => setDbIndex(String(db)),
      ),
    )
  }

  return (
    <S.Container>
      <S.HeaderRow responsive align="center" justify="between">
        <S.BreadcrumbsWrapper>
          <S.BreadcrumbsContainer
            data-testid="breadcrumbs-container"
            align="center"
          >
            <FlexItem style={{ overflow: 'hidden' }} grow={false}>
              <S.BreadcrumbsContainer
                align="center"
                data-testid="breadcrumbs-container"
                gap="m"
              >
                <FeatureFlagComponent name={FeatureFlags.envDependent}>
                  <RiTooltip
                    position="bottom"
                    content={
                      server?.buildType === BuildType.RedisStack
                        ? 'Edit database'
                        : 'Redis Databases'
                    }
                  >
                    <Link
                      color="subdued"
                      underline
                      variant="inline"
                      aria-label={
                        server?.buildType === BuildType.RedisStack
                          ? 'Edit database'
                          : 'Redis Databases'
                      }
                      data-testid="my-redis-db-btn"
                      onClick={goHome}
                    >
                      Databases
                    </Link>
                  </RiTooltip>
                </FeatureFlagComponent>
                <Row align="center" justify="start" gap="s" full>
                  <FeatureFlagComponent name={FeatureFlags.envDependent}>
                    <FlexItem>
                      <S.Divider>/</S.Divider>
                    </FlexItem>
                  </FeatureFlagComponent>
                  {returnUrlBase && returnUrl && (
                    <FeatureFlagComponent
                      name={FeatureFlags.envDependent}
                      otherwise={
                        <S.ReturnToItem data-testid="return-to-sm-item">
                          <RiTooltip
                            position="bottom"
                            content={returnUrlTooltip || returnUrlLabel}
                          >
                            <S.BreadCrumbLink
                              size="m"
                              color="primary"
                              variant="semiBold"
                              aria-label={returnUrlTooltip || returnUrlLabel}
                              onClick={goToReturnUrl}
                              onKeyDown={goToReturnUrl}
                            >
                              &#60; {returnUrlLabel}
                            </S.BreadCrumbLink>
                          </RiTooltip>
                        </S.ReturnToItem>
                      }
                    />
                  )}
                  <S.BreadcrumbsWrapper grow>
                    {isRedisStack || !envDependentFeature?.flag ? (
                      <S.DbName>{name}</S.DbName>
                    ) : (
                      <InstancesNavigationPopover name={name} />
                    )}
                  </S.BreadcrumbsWrapper>
                  {databases > 1 && (
                    <Row align="center" grow={false}>
                      {isDbIndexEditing ? (
                        <S.DbIndexEditorWrapper>
                          <InlineItemEditor
                            controlsPosition="right"
                            onApply={handleChangeDbIndex}
                            onDecline={() => setIsDbIndexEditing(false)}
                            viewChildrenMode={false}
                          >
                            <S.DbIndexInput>
                              <NumericInput
                                autoSize
                                autoValidate
                                min={0}
                                onFocus={selectOnFocus}
                                onChange={(value) =>
                                  setDbIndex(value ? value.toString() : '')
                                }
                                value={Number(dbIndex)}
                                placeholder="Database Index"
                                data-testid="change-index-input"
                              />
                            </S.DbIndexInput>
                          </InlineItemEditor>
                        </S.DbIndexEditorWrapper>
                      ) : (
                        <EmptyButton
                          icon={EditIcon}
                          iconSide="right"
                          onClick={() => setIsDbIndexEditing(true)}
                          disabled={isDbIndexDisabled || instanceLoading}
                          data-testid="change-index-btn"
                        >
                          <ColorText size="m" color="primary">
                            db{db || 0}
                          </ColorText>
                        </EmptyButton>
                      )}
                    </Row>
                  )}
                  <Row align="center" grow={false}>
                    <RiTooltip
                      position="right"
                      maxWidth={S.TOOLTIP_MAX_WIDTH}
                      anchorClassName="tooltip-anchor"
                      content={
                        <ShortInstanceInfo
                          info={{
                            name,
                            host,
                            port,
                            user: username,
                            connectionType,
                            version,
                            dbIndex: db,
                          }}
                          modules={modules}
                          databases={databases}
                        />
                      }
                    >
                      <S.InfoIcon className="infoIcon">
                        <RiIcon
                          type="InfoIcon"
                          size="l"
                          data-testid="db-info-icon"
                        />
                      </S.InfoIcon>
                    </RiTooltip>
                  </Row>
                </Row>
              </S.BreadcrumbsContainer>
            </FlexItem>
          </S.BreadcrumbsContainer>
        </S.BreadcrumbsWrapper>

        <S.CenterFlexItem>
          <DatabaseOverview />
        </S.CenterFlexItem>

        <FlexItem>
          <Row align="center" justify="end">
            {isAnyChatAvailable && (
              <S.LeftMarginFlexItem>
                <CopilotTrigger />
              </S.LeftMarginFlexItem>
            )}

            <S.LeftMarginFlexItem>
              <InsightsTrigger />
            </S.LeftMarginFlexItem>

            <UserProfile />
          </Row>
        </FlexItem>
      </S.HeaderRow>
    </S.Container>
  )
}

export default InstanceHeader
