import React from 'react'
import { find } from 'lodash'
import cx from 'classnames'
import { CloudJobName, CloudJobStep } from 'uiSrc/electron/constants'
import ExternalLink from 'uiSrc/components/base/external-link'
import Divider from 'uiSrc/components/divider/Divider'
import { OAuthProviders } from 'uiSrc/components/oauth/oauth-select-plan/constants'

import { CloudSuccessResult } from 'uiSrc/slices/interfaces'

import { Maybe } from 'uiSrc/utils'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { Text } from 'uiSrc/components/base/text'
import {
  EXTERNAL_LINKS,
  UTM_CAMPAINGS,
  UTM_MEDIUMS,
} from 'uiSrc/constants/links'
import { RiFlexItem, RiRow } from 'uiSrc/components/base/layout'
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import { RiPrimaryButton, RiSecondaryButton } from 'uiSrc/components/base/forms'
import { RiIcon } from 'uiSrc/components/base/icons'
import { Title } from 'uiSrc/components/base/text/Title'
import { RiLink, RiLoader } from 'uiSrc/components/base/display'
import styles from './styles.module.scss'

export enum InfiniteMessagesIds {
  oAuthProgress = 'oAuthProgress',
  oAuthSuccess = 'oAuthSuccess',
  autoCreateDb = 'autoCreateDb',
  databaseExists = 'databaseExists',
  databaseImportForbidden = 'databaseImportForbidden',
  subscriptionExists = 'subscriptionExists',
  appUpdateAvailable = 'appUpdateAvailable',
  pipelineDeploySuccess = 'pipelineDeploySuccess',
}

const MANAGE_DB_LINK = getUtmExternalLink(EXTERNAL_LINKS.cloudConsole, {
  campaign: UTM_CAMPAINGS.Main,
  medium: UTM_MEDIUMS.Main,
})

export const INFINITE_MESSAGES = {
  AUTHENTICATING: () => ({
    id: InfiniteMessagesIds.oAuthProgress,
    Inner: (
      <div role="presentation" data-testid="authenticating-notification">
        <RiRow justify="end">
          <RiFlexItem>
            <RiLoader className={cx('infiniteMessage__icon', styles.loading)} />
          </RiFlexItem>
          <RiFlexItem grow>
            <Title className="infiniteMessage__title">Authenticating…</Title>
            <Text size="xs">
              This may take several seconds, but it is totally worth it!
            </Text>
          </RiFlexItem>
        </RiRow>
      </div>
    ),
  }),
  PENDING_CREATE_DB: (step?: CloudJobStep) => ({
    id: InfiniteMessagesIds.oAuthProgress,
    Inner: (
      <div role="presentation" data-testid="pending-create-db-notification">
        <RiRow justify="end">
          <RiFlexItem grow={false}>
            <RiLoader className={cx('infiniteMessage__icon', styles.loading)} />
          </RiFlexItem>
          <RiFlexItem grow>
            <Title className="infiniteMessage__title">
              <span>
                {(step === CloudJobStep.Credentials || !step) &&
                  'Processing Cloud API keys…'}
                {step === CloudJobStep.Subscription &&
                  'Processing Cloud subscriptions…'}
                {step === CloudJobStep.Database &&
                  'Creating a free trial Cloud database…'}
                {step === CloudJobStep.Import &&
                  'Importing a free trial Cloud database…'}
              </span>
            </Title>
            <Text size="xs">
              This may take several minutes, but it is totally worth it!
            </Text>
            <RiSpacer size="m" />
            <Text size="xs">
              You can continue working in Redis Insight, and we will notify you
              once done.
            </Text>
          </RiFlexItem>
        </RiRow>
      </div>
    ),
  }),
  SUCCESS_CREATE_DB: (
    details: Omit<CloudSuccessResult, 'resourceId'>,
    onSuccess: () => void,
    jobName: Maybe<CloudJobName>,
  ) => {
    const vendor = find(OAuthProviders, ({ id }) => id === details.provider)
    const withFeed =
      jobName &&
      [
        CloudJobName.CreateFreeDatabase,
        CloudJobName.CreateFreeSubscriptionAndDatabase,
      ].includes(jobName)
    const text = `You can now use your Redis Cloud database${withFeed ? ' with pre-loaded sample data' : ''}.`
    return {
      id: InfiniteMessagesIds.oAuthSuccess,
      className: 'wide',
      Inner: (
        <div
          role="presentation"
          onMouseDown={(e) => {
            e.preventDefault()
          }}
          onMouseUp={(e) => {
            e.preventDefault()
          }}
          data-testid="success-create-db-notification"
        >
          <RiRow justify="end">
            <RiFlexItem className="infiniteMessage__icon">
              <RiIcon type="ChampagneIcon" size="original" />
            </RiFlexItem>
            <RiFlexItem grow>
              <Title className="infiniteMessage__title">Congratulations!</Title>
              <Text size="xs">
                {text}
                <RiSpacer size="s" />
                <b>Notice:</b> the database will be deleted after 15 days of
                inactivity.
              </Text>
              {!!details && (
                <>
                  <RiSpacer size="m" />
                  <Divider variant="fullWidth" />
                  <RiSpacer size="m" />
                  <RiRow className={styles.detailsRow} justify="between">
                    <RiFlexItem>
                      <Text size="xs">Plan</Text>
                    </RiFlexItem>
                    <RiFlexItem data-testid="notification-details-plan">
                      <Text size="xs">Free</Text>
                    </RiFlexItem>
                  </RiRow>
                  <RiRow className={styles.detailsRow} justify="between">
                    <RiFlexItem>
                      <Text size="xs">Cloud Vendor</Text>
                    </RiFlexItem>
                    <RiFlexItem
                      className={styles.vendorLabel}
                      data-testid="notification-details-vendor"
                    >
                      {!!vendor?.icon && <RiIcon type={vendor?.icon} />}
                      <Text size="xs">{vendor?.label}</Text>
                    </RiFlexItem>
                  </RiRow>
                  <RiRow className={styles.detailsRow} justify="between">
                    <RiFlexItem>
                      <Text size="xs">Region</Text>
                    </RiFlexItem>
                    <RiFlexItem data-testid="notification-details-region">
                      <Text size="xs">{details.region}</Text>
                    </RiFlexItem>
                  </RiRow>
                </>
              )}
              <RiSpacer size="m" />
              <RiRow justify="between" align="center">
                <RiFlexItem>
                  <ExternalLink href={MANAGE_DB_LINK}>Manage DB</ExternalLink>
                </RiFlexItem>
                <RiFlexItem>
                  <RiPrimaryButton
                    size="s"
                    onClick={() => onSuccess()}
                    data-testid="notification-connect-db"
                  >
                    Connect
                  </RiPrimaryButton>
                </RiFlexItem>
              </RiRow>
            </RiFlexItem>
          </RiRow>
        </div>
      ),
    }
  },
  DATABASE_EXISTS: (onSuccess?: () => void, onClose?: () => void) => ({
    id: InfiniteMessagesIds.databaseExists,
    Inner: (
      <div
        role="presentation"
        onMouseDown={(e) => {
          e.preventDefault()
        }}
        onMouseUp={(e) => {
          e.preventDefault()
        }}
        data-testid="database-exists-notification"
      >
        <Title className="infiniteMessage__title">
          You already have a free trial Redis Cloud subscription.
        </Title>
        <Text size="xs">
          Do you want to import your existing database into Redis Insight?
        </Text>
        <RiSpacer size="m" />
        <RiRow justify="between">
          <RiFlexItem>
            <RiPrimaryButton
              size="s"
              onClick={() => onSuccess?.()}
              data-testid="import-db-sso-btn"
            >
              Import
            </RiPrimaryButton>
          </RiFlexItem>
          <RiFlexItem>
            <RiSecondaryButton
              size="s"
              className="infiniteMessage__btn"
              onClick={() => onClose?.()}
              data-testid="cancel-import-db-sso-btn"
            >
              Cancel
            </RiSecondaryButton>
          </RiFlexItem>
        </RiRow>
      </div>
    ),
  }),
  DATABASE_IMPORT_FORBIDDEN: (onClose?: () => void) => ({
    id: InfiniteMessagesIds.databaseImportForbidden,
    Inner: (
      <div
        role="presentation"
        onMouseDown={(e) => {
          e.preventDefault()
        }}
        onMouseUp={(e) => {
          e.preventDefault()
        }}
        data-testid="database-import-forbidden-notification"
      >
        <Title className="infiniteMessage__title">
          Unable to import Cloud database.
        </Title>
        <Text size="xs">
          Adding your Redis Cloud database to Redis Insight is disabled due to a
          setting restricting database connection management.
          <RiSpacer size="m" />
          Log in to{' '}
          <RiLink
            target="_blank"
            color="text"
            tabIndex={-1}
            href="https://cloud.redis.io/#/databases?utm_source=redisinsight&utm_medium=main&utm_campaign=disabled_db_management"
          >
            Redis Cloud
          </RiLink>{' '}
          to check your database.
        </Text>
        <RiSpacer size="m" />
        <RiRow justify="end">
          <RiFlexItem>
            <RiPrimaryButton
              size="s"
              onClick={() => onClose?.()}
              data-testid="database-import-forbidden-notification-ok-btn"
            >
              Ok
            </RiPrimaryButton>
          </RiFlexItem>
        </RiRow>
      </div>
    ),
  }),
  SUBSCRIPTION_EXISTS: (onSuccess?: () => void, onClose?: () => void) => ({
    id: InfiniteMessagesIds.subscriptionExists,
    Inner: (
      <div
        role="presentation"
        onMouseDown={(e) => {
          e.preventDefault()
        }}
        onMouseUp={(e) => {
          e.preventDefault()
        }}
        data-testid="subscription-exists-notification"
      >
        <Title className="infiniteMessage__title">
          Your subscription does not have a free trial Redis Cloud database.
        </Title>
        <Text size="xs">
          Do you want to create a free trial database in your existing
          subscription?
        </Text>
        <RiSpacer size="m" />
        <RiRow justify="between">
          <RiFlexItem>
            <RiPrimaryButton
              size="s"
              onClick={() => onSuccess?.()}
              data-testid="create-subscription-sso-btn"
            >
              Create
            </RiPrimaryButton>
          </RiFlexItem>
          <RiFlexItem>
            <RiSecondaryButton
              size="s"
              className="infiniteMessage__btn"
              onClick={() => onClose?.()}
              data-testid="cancel-create-subscription-sso-btn"
            >
              Cancel
            </RiSecondaryButton>
          </RiFlexItem>
        </RiRow>
      </div>
    ),
  }),
  AUTO_CREATING_DATABASE: () => ({
    id: InfiniteMessagesIds.autoCreateDb,
    Inner: (
      <div role="presentation" data-testid="pending-create-db-notification">
        <RiRow justify="end">
          <RiFlexItem>
            <RiLoader className={cx('infiniteMessage__icon', styles.loading)} />
          </RiFlexItem>
          <RiFlexItem grow>
            <Title className="infiniteMessage__title">
              Connecting to your database
            </Title>
            <Text size="xs">
              This may take several minutes, but it is totally worth it!
            </Text>
          </RiFlexItem>
        </RiRow>
      </div>
    ),
  }),
  APP_UPDATE_AVAILABLE: (version: string, onSuccess?: () => void) => ({
    id: InfiniteMessagesIds.appUpdateAvailable,
    Inner: (
      <div
        role="presentation"
        onMouseDown={(e) => {
          e.preventDefault()
        }}
        onMouseUp={(e) => {
          e.preventDefault()
        }}
        data-testid="app-update-available-notification"
      >
        <Title className="infiniteMessage__title">
          New version is now available
        </Title>
        <Text size="s">
          <>
            With Redis Insight
            {` ${version} `}
            you have access to new useful features and optimizations.
            <br />
            Restart Redis Insight to install updates.
          </>
        </Text>
        <br />
        <RiPrimaryButton
          size="s"
          onClick={() => onSuccess?.()}
          data-testid="app-restart-btn"
        >
          Restart
        </RiPrimaryButton>
      </div>
    ),
  }),
  SUCCESS_DEPLOY_PIPELINE: () => ({
    id: InfiniteMessagesIds.pipelineDeploySuccess,
    className: 'wide',
    Inner: (
      <div
        role="presentation"
        onMouseDown={(e) => {
          e.preventDefault()
        }}
        onMouseUp={(e) => {
          e.preventDefault()
        }}
        data-testid="success-deploy-pipeline-notification"
      >
        <RiRow justify="end">
          <RiFlexItem className="infiniteMessage__icon">
            <RiIcon type="ChampagneIcon" size="original" />
          </RiFlexItem>
          <RiFlexItem grow>
            <Title className="infiniteMessage__title">Congratulations!</Title>
            <Text size="xs">
              Deployment completed successfully!
              <br />
              Check out the pipeline statistics page.
            </Text>
            <RiSpacer size="m" />
            {/* // TODO remove display none when statistics page will be available */}
            <RiRow style={{ display: 'none' }} justify="end" align="center">
              <RiFlexItem>
                <RiPrimaryButton
                  size="s"
                  onClick={() => {}}
                  data-testid="notification-connect-db"
                >
                  Statistics
                </RiPrimaryButton>
              </RiFlexItem>
            </RiRow>
          </RiFlexItem>
        </RiRow>
      </div>
    ),
  }),
}
