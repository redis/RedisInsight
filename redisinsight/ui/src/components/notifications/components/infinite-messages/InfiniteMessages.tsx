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
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { Title } from 'uiSrc/components/base/text/Title'
import { Link } from 'uiSrc/components/base/link/Link'
import { Loader } from 'uiSrc/components/base/display'
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
        <Row justify="end">
          <FlexItem>
            <Loader className={cx('infiniteMessage__icon', styles.loading)} />
          </FlexItem>
          <FlexItem grow>
            <Title className="infiniteMessage__title" size="XS">
              Authenticating…
            </Title>
            <Text size="xs">
              This may take several seconds, but it is totally worth it!
            </Text>
          </FlexItem>
        </Row>
      </div>
    ),
  }),
  PENDING_CREATE_DB: (step?: CloudJobStep) => ({
    id: InfiniteMessagesIds.oAuthProgress,
    Inner: (
      <div role="presentation" data-testid="pending-create-db-notification">
        <Row justify="end">
          <FlexItem grow={false}>
            <Loader className={cx('infiniteMessage__icon', styles.loading)} />
          </FlexItem>
          <FlexItem grow>
            <Title className="infiniteMessage__title" size="XS">
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
            <Spacer size="m" />
            <Text size="xs">
              You can continue working in Redis Insight, and we will notify you
              once done.
            </Text>
          </FlexItem>
        </Row>
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
          <Row justify="end">
            <FlexItem className="infiniteMessage__icon">
              <RiIcon type="ChampagneIcon" size="original" />
            </FlexItem>
            <FlexItem grow>
              <Title className="infiniteMessage__title" size="XS">
                Congratulations!
              </Title>
              <Text size="xs">
                {text}
                <Spacer size="s" />
                <b>Notice:</b> the database will be deleted after 15 days of
                inactivity.
              </Text>
              {!!details && (
                <>
                  <Spacer size="m" />
                  <Divider variant="fullWidth" />
                  <Spacer size="m" />
                  <Row className={styles.detailsRow} justify="between">
                    <FlexItem>
                      <Text size="xs">Plan</Text>
                    </FlexItem>
                    <FlexItem data-testid="notification-details-plan">
                      <Text size="xs">Free</Text>
                    </FlexItem>
                  </Row>
                  <Row className={styles.detailsRow} justify="between">
                    <FlexItem>
                      <Text size="xs">Cloud Vendor</Text>
                    </FlexItem>
                    <FlexItem
                      className={styles.vendorLabel}
                      data-testid="notification-details-vendor"
                    >
                      {!!vendor?.icon && <RiIcon type={vendor?.icon} />}
                      <Text size="xs">{vendor?.label}</Text>
                    </FlexItem>
                  </Row>
                  <Row className={styles.detailsRow} justify="between">
                    <FlexItem>
                      <Text size="xs">Region</Text>
                    </FlexItem>
                    <FlexItem data-testid="notification-details-region">
                      <Text size="xs">{details.region}</Text>
                    </FlexItem>
                  </Row>
                </>
              )}
              <Spacer size="m" />
              <Row justify="between" align="center">
                <FlexItem>
                  <ExternalLink href={MANAGE_DB_LINK}>Manage DB</ExternalLink>
                </FlexItem>
                <FlexItem>
                  <PrimaryButton
                    size="s"
                    onClick={() => onSuccess()}
                    data-testid="notification-connect-db"
                  >
                    Connect
                  </PrimaryButton>
                </FlexItem>
              </Row>
            </FlexItem>
          </Row>
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
        <Title className="infiniteMessage__title" size="XS">
          You already have a free trial Redis Cloud subscription.
        </Title>
        <Text size="xs">
          Do you want to import your existing database into Redis Insight?
        </Text>
        <Spacer size="m" />
        <Row justify="between">
          <FlexItem>
            <PrimaryButton
              size="s"
              onClick={() => onSuccess?.()}
              data-testid="import-db-sso-btn"
            >
              Import
            </PrimaryButton>
          </FlexItem>
          <FlexItem>
            <SecondaryButton
              size="s"
              className="infiniteMessage__btn"
              onClick={() => onClose?.()}
              data-testid="cancel-import-db-sso-btn"
            >
              Cancel
            </SecondaryButton>
          </FlexItem>
        </Row>
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
        <Title className="infiniteMessage__title" size="XS">
          Unable to import Cloud database.
        </Title>
        <Text size="xs">
          Adding your Redis Cloud database to Redis Insight is disabled due to a
          setting restricting database connection management.
          <Spacer size="m" />
          Log in to{' '}
          <Link
            target="_blank"
            color="text"
            tabIndex={-1}
            href="https://cloud.redis.io/#/databases?utm_source=redisinsight&utm_medium=main&utm_campaign=disabled_db_management"
          >
            Redis Cloud
          </Link>{' '}
          to check your database.
        </Text>
        <Spacer size="m" />
        <Row justify="end">
          <FlexItem>
            <PrimaryButton
              size="s"
              onClick={() => onClose?.()}
              data-testid="database-import-forbidden-notification-ok-btn"
            >
              Ok
            </PrimaryButton>
          </FlexItem>
        </Row>
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
        <Title className="infiniteMessage__title" size="XS">
          Your subscription does not have a free trial Redis Cloud database.
        </Title>
        <Text size="xs">
          Do you want to create a free trial database in your existing
          subscription?
        </Text>
        <Spacer size="m" />
        <Row justify="between">
          <FlexItem>
            <PrimaryButton
              size="s"
              onClick={() => onSuccess?.()}
              data-testid="create-subscription-sso-btn"
            >
              Create
            </PrimaryButton>
          </FlexItem>
          <FlexItem>
            <SecondaryButton
              size="s"
              className="infiniteMessage__btn"
              onClick={() => onClose?.()}
              data-testid="cancel-create-subscription-sso-btn"
            >
              Cancel
            </SecondaryButton>
          </FlexItem>
        </Row>
      </div>
    ),
  }),
  AUTO_CREATING_DATABASE: () => ({
    id: InfiniteMessagesIds.autoCreateDb,
    Inner: (
      <div role="presentation" data-testid="pending-create-db-notification">
        <Row justify="end">
          <FlexItem>
            <Loader className={cx('infiniteMessage__icon', styles.loading)} />
          </FlexItem>
          <FlexItem grow>
            <Title className="infiniteMessage__title" size="XS">
              Connecting to your database
            </Title>
            <Text size="xs">
              This may take several minutes, but it is totally worth it!
            </Text>
          </FlexItem>
        </Row>
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
        <Title className="infiniteMessage__title" size="XS">
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
        <PrimaryButton
          size="s"
          onClick={() => onSuccess?.()}
          data-testid="app-restart-btn"
        >
          Restart
        </PrimaryButton>
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
        <Row justify="end">
          <FlexItem className="infiniteMessage__icon">
            <RiIcon type="ChampagneIcon" size="original" />
          </FlexItem>
          <FlexItem grow>
            <Title className="infiniteMessage__title" size="XS">
              Congratulations!
            </Title>
            <Text size="xs">
              Deployment completed successfully!
              <br />
              Check out the pipeline statistics page.
            </Text>
            <Spacer size="m" />
            {/* // TODO remove display none when statistics page will be available */}
            <Row style={{ display: 'none' }} justify="end" align="center">
              <FlexItem>
                <PrimaryButton
                  size="s"
                  onClick={() => {}}
                  data-testid="notification-connect-db"
                >
                  Statistics
                </PrimaryButton>
              </FlexItem>
            </Row>
          </FlexItem>
        </Row>
      </div>
    ),
  }),
}
