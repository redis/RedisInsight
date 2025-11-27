import React, { useContext, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { isEmpty } from 'lodash'
import cx from 'classnames'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  instancesSelector,
  setShownColumns,
} from 'uiSrc/slices/instances/instances'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import PromoLink from 'uiSrc/components/promo-link/PromoLink'

import { FeatureFlagComponent, OAuthSsoHandlerDialog } from 'uiSrc/components'
import { getPathToResource } from 'uiSrc/services/resourcesService'
import { ContentCreateRedis } from 'uiSrc/slices/interfaces/content'
import { CREATE_CLOUD_DB_ID, HELP_LINKS } from 'uiSrc/pages/home/constants'
import { contentSelector } from 'uiSrc/slices/content/create-redis-buttons'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { getContentByFeature } from 'uiSrc/utils/content'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import {
  COLUMN_FIELD_NAME_MAP,
  DatabaseListColumn,
  FeatureFlags,
} from 'uiSrc/constants'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import {
  EmptyButton,
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { PlusIcon } from 'uiSrc/components/base/icons'
import ColumnsConfigPopover from 'uiSrc/components/columns-config/ColumnsConfigPopover'
import handleClickFreeCloudDb from '../database-list-component/methods/handleClickFreeCloudDb'
import SearchDatabasesList from '../search-databases-list'

import styles from './styles.module.scss'

export interface Props {
  onAddInstance: () => void
}

const DatabaseListHeader = ({ onAddInstance }: Props) => {
  const { data: instances, shownColumns } = useSelector(instancesSelector)
  const featureFlags = useSelector(appFeatureFlagsFeaturesSelector)
  const { loading, data } = useSelector(contentSelector)

  const [promoData, setPromoData] = useState<ContentCreateRedis>()

  const { theme } = useContext(ThemeContext)
  const { [FeatureFlags.enhancedCloudUI]: enhancedCloudUIFeature } =
    featureFlags
  const isShowPromoBtn = !enhancedCloudUIFeature?.flag

  const dispatch = useDispatch()

  useEffect(() => {
    if (loading || !data || isEmpty(data)) {
      return
    }

    if (data?.cloud && !isEmpty(data.cloud)) {
      setPromoData(getContentByFeature(data.cloud as any, featureFlags))
    }
  }, [loading, data, featureFlags])

  const handleOnAddDatabase = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_CLICKED,
      eventData: {
        source: OAuthSocialSource.DatabasesList,
      },
    })
    onAddInstance()
  }

  const handleClickLink = (event: TelemetryEvent, eventData: any = {}) => {
    if (event) {
      sendEventTelemetry({
        event,
        eventData: {
          ...eventData,
        },
      })
    }
  }

  const handleCreateDatabaseClick = (
    event: TelemetryEvent,
    eventData: any = {},
  ) => {
    handleClickLink(event, eventData)
  }

  const handleColumnsChange = (
    next: DatabaseListColumn[],
    diff: { shown: DatabaseListColumn[]; hidden: DatabaseListColumn[] },
  ) => {
    dispatch(setShownColumns(next))
    sendEventTelemetry({
      event: TelemetryEvent.DATABASE_LIST_COLUMNS_CLICKED,
      eventData: diff,
    })
  }

  const AddCloudInstanceButton = () => (
    <FeatureFlagComponent
      name={[FeatureFlags.enhancedCloudUI, FeatureFlags.cloudAds]}
    >
      <PrimaryButton
        onClick={handleClickFreeCloudDb}
        data-testid={`${CREATE_CLOUD_DB_ID}-button`}
      >
        Create free Cloud database
      </PrimaryButton>
    </FeatureFlagComponent>
  )

  const AddLocalInstanceButton = () => (
    <FeatureFlagComponent name={FeatureFlags.databaseManagement}>
      <EmptyButton
        variant="primary"
        onClick={handleOnAddDatabase}
        data-testid="add-redis-database-short"
        icon={PlusIcon}
      >
        Connect existing database
      </EmptyButton>
    </FeatureFlagComponent>
  )

  const CreateBtn = ({ content }: { content: ContentCreateRedis }) => {
    if (!isShowPromoBtn) return null

    const { title, description, styles: stylesCss, links } = content
    // @ts-ignore
    const linkStyles = stylesCss ? stylesCss[theme] : {}
    return (
      <OAuthSsoHandlerDialog>
        {(ssoCloudHandlerClick, isSSOEnabled) => (
          <PromoLink
            title={title}
            description={description}
            url={links?.main?.url}
            testId="promo-btn"
            styles={{
              ...linkStyles,
              backgroundImage: linkStyles?.backgroundImage
                ? `url(${getPathToResource(linkStyles.backgroundImage)})`
                : undefined,
            }}
            onClick={(e) => {
              !isSSOEnabled &&
                handleCreateDatabaseClick(HELP_LINKS.cloud.event, {
                  source: HELP_LINKS.cloud.sources.databaseList,
                })
              ssoCloudHandlerClick(e, {
                source: OAuthSocialSource.ListOfDatabases,
                action: OAuthSocialAction.Create,
              })
            }}
          />
        )}
      </OAuthSsoHandlerDialog>
    )
  }

  return (
    <div className={styles.containerDl}>
      <Row
        className={styles.contentDL}
        align="center"
        responsive={false}
        gap="s"
      >
        <FlexItem direction="row" $gap="m">
          <AddCloudInstanceButton />
          <AddLocalInstanceButton />
        </FlexItem>
        {!loading && !isEmpty(data) && (
          <FlexItem className={cx(styles.promo)}>
            <Row align="center" gap="s">
              {promoData && (
                <FeatureFlagComponent name={FeatureFlags.cloudAds}>
                  <FlexItem>
                    <CreateBtn content={promoData} />
                  </FlexItem>
                </FeatureFlagComponent>
              )}
            </Row>
          </FlexItem>
        )}
        {instances.length > 0 && (
          <Row justify="end" align="center" gap="l">
            <ColumnsConfigPopover
              columnsMap={COLUMN_FIELD_NAME_MAP}
              shownColumns={shownColumns}
              onChange={handleColumnsChange}
            />
            <SearchDatabasesList />
          </Row>
        )}
      </Row>
      <Spacer className={styles.spacerDl} />
    </div>
  )
}

export default DatabaseListHeader
