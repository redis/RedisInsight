import React, { useContext, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { isEmpty } from 'lodash'
import cx from 'classnames'

import { RiPopover } from 'uiBase/index'
import { RiFlexItem, RiRow, RiSpacer } from 'uiBase/layout'
import { RiPrimaryButton, RiSecondaryButton, RiCheckbox } from 'uiBase/forms'
import { ColumnsIcon } from 'uiBase/icons'
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
import { HELP_LINKS } from 'uiSrc/pages/home/constants'
import { contentSelector } from 'uiSrc/slices/content/create-redis-buttons'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { getContentByFeature } from 'uiSrc/utils/content'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import {
  COLUMN_FIELD_NAME_MAP,
  DatabaseListColumn,
  FeatureFlags,
} from 'uiSrc/constants'
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
  const [columnsConfigShown, setColumnsConfigShown] = useState(false)

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
      setPromoData(getContentByFeature(data.cloud, featureFlags))
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

  const toggleColumnsConfigVisibility = () =>
    setColumnsConfigShown(!columnsConfigShown)

  const changeShownColumns = (status: boolean, column: DatabaseListColumn) => {
    const newColumns = status
      ? [...shownColumns, column]
      : shownColumns.filter((col) => col !== column)

    dispatch(setShownColumns(newColumns))

    const shown: DatabaseListColumn[] = []
    const hidden: DatabaseListColumn[] = []

    if (status) {
      shown.push(column)
    } else {
      hidden.push(column)
    }

    sendEventTelemetry({
      event: TelemetryEvent.DATABASE_LIST_COLUMNS_CLICKED,
      eventData: {
        shown,
        hidden,
      },
    })
  }

  const AddInstanceBtn = () => (
    <RiPrimaryButton
      onClick={handleOnAddDatabase}
      className={styles.addInstanceBtn}
      data-testid="add-redis-database-short"
    >
      <span>+ Add Redis database</span>
    </RiPrimaryButton>
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

  const columnCheckboxes = Array.from(COLUMN_FIELD_NAME_MAP.entries()).map(
    ([field, name]) => (
      <RiCheckbox
        key={`show-${field}`}
        id={`show-${field}`}
        name={`show-${field}`}
        label={name}
        checked={shownColumns.includes(field)}
        disabled={shownColumns.includes(field) && shownColumns.length === 1}
        onChange={(e) => changeShownColumns(e.target.checked, field)}
        data-testid={`show-${field}`}
      />
    ),
  )

  return (
    <div className={styles.containerDl}>
      <RiRow
        className={styles.contentDL}
        align="center"
        responsive={false}
        gap="s"
      >
        <RiFlexItem>
          <FeatureFlagComponent name={FeatureFlags.databaseManagement}>
            <AddInstanceBtn />
          </FeatureFlagComponent>
        </RiFlexItem>
        {!loading && !isEmpty(data) && (
          <RiFlexItem className={cx(styles.promo)}>
            <RiRow align="center" gap="s">
              {promoData && (
                <FeatureFlagComponent name={FeatureFlags.cloudAds}>
                  <RiFlexItem>
                    <CreateBtn content={promoData} />
                  </RiFlexItem>
                </FeatureFlagComponent>
              )}
            </RiRow>
          </RiFlexItem>
        )}
        {instances.length > 0 && (
          <RiFlexItem grow>
            <RiRow justify="end" align="center" gap="s">
              <RiFlexItem className={styles.columnsButtonItem}>
                <RiPopover
                  ownFocus={false}
                  anchorPosition="downLeft"
                  isOpen={columnsConfigShown}
                  closePopover={() => setColumnsConfigShown(false)}
                  data-testid="columns-config-popover"
                  button={
                    <RiSecondaryButton
                      icon={ColumnsIcon}
                      onClick={toggleColumnsConfigVisibility}
                      className={styles.columnsButton}
                      data-testid="btn-columns-config"
                      aria-label="columns"
                    >
                      <span>Columns</span>
                    </RiSecondaryButton>
                  }
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    {columnCheckboxes}
                  </div>
                </RiPopover>
              </RiFlexItem>
              <RiFlexItem>
                <SearchDatabasesList />
              </RiFlexItem>
            </RiRow>
          </RiFlexItem>
        )}
      </RiRow>
      <RiSpacer />
    </div>
  )
}

export default DatabaseListHeader
