import React from 'react'
import { find } from 'lodash'
import { CloudJobName, CloudJobStep } from 'uiSrc/electron/constants'
import ExternalLink from 'uiSrc/components/base/external-link'
import Divider from 'uiSrc/components/divider/Divider'
import { OAuthProviders } from 'uiSrc/components/oauth/oauth-select-plan/constants'
import { LoaderLargeIcon } from 'uiSrc/components/base/icons'

import { CloudSuccessResult, InfiniteMessage } from 'uiSrc/slices/interfaces'

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
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'

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

interface InfiniteMessagesType {
  AUTHENTICATING: () => InfiniteMessage
  PENDING_CREATE_DB: (step?: CloudJobStep) => InfiniteMessage
  SUCCESS_CREATE_DB: (
    details: Omit<CloudSuccessResult, 'resourceId'>,
    onSuccess: () => void,
    jobName: Maybe<CloudJobName>,
  ) => InfiniteMessage
  DATABASE_EXISTS: (
    onSuccess?: () => void,
    onClose?: () => void,
  ) => InfiniteMessage
  DATABASE_IMPORT_FORBIDDEN: (onClose?: () => void) => InfiniteMessage
  SUBSCRIPTION_EXISTS: (
    onSuccess?: () => void,
    onClose?: () => void,
  ) => InfiniteMessage
  AUTO_CREATING_DATABASE: () => InfiniteMessage
  APP_UPDATE_AVAILABLE: (
    version: string,
    onSuccess?: () => void,
  ) => InfiniteMessage
  SUCCESS_DEPLOY_PIPELINE: () => InfiniteMessage
}

export const INFINITE_MESSAGES: InfiniteMessagesType = {
  AUTHENTICATING: () => ({
    id: InfiniteMessagesIds.oAuthProgress,
    message: 'Authenticating…',
    description: 'This may take several seconds, but it is totally worth it!',
    customIcon: LoaderLargeIcon,
  }),
  PENDING_CREATE_DB: (step?: CloudJobStep) => ({
    id: InfiniteMessagesIds.oAuthProgress,
    customIcon: LoaderLargeIcon,
    variation: step,
    message: (
      <>
        {(step === CloudJobStep.Credentials || !step) &&
          'Processing Cloud API keys…'}
        {step === CloudJobStep.Subscription &&
          'Processing Cloud subscriptions…'}
        {step === CloudJobStep.Database &&
          'Creating a free Redis Cloud database…'}
        {step === CloudJobStep.Import &&
          'Importing a free Redis Cloud database…'}
      </>
    ),
    description: (
      <>
        This may take several minutes, but it is totally worth it!
        <Spacer size="m" />
        You can continue working in Redis Insight, and we will notify you once
        done.
      </>
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
      message: 'Congratulations!',
      variant: 'success',
      description: (
        <>
          {text}
          <Spacer size="m" />
          <Text variant="semiBold" component="span">
            Notice:
          </Text>{' '}
          the database will be deleted after 15 days of inactivity.
          {!!details && (
            <>
              <Spacer size="m" />
              <Divider />
              <Spacer size="m" />
              <Row className={styles.detailsRow} justify="between">
                <FlexItem>
                  <Text size="xs">Plan</Text>
                </FlexItem>
                <FlexItem data-testid="notification-details-plan">
                  <Text size="xs">Free</Text>
                </FlexItem>
              </Row>
              <Row
                className={styles.detailsRow}
                justify="between"
                align="center"
              >
                <FlexItem>
                  <Text size="xs">Cloud Vendor</Text>
                </FlexItem>
                <FlexItem
                  className={styles.vendorLabel}
                  data-testid="notification-details-vendor"
                  $gap="s"
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
              <ExternalLink href={MANAGE_DB_LINK} iconSize="S" variant="inline">
                Manage DB
              </ExternalLink>
            </FlexItem>
            <FlexItem>
              <PrimaryButton
                size="small"
                onClick={() => onSuccess()}
                data-testid="notification-connect-db"
              >
                Connect
              </PrimaryButton>
            </FlexItem>
          </Row>
        </>
      ),
    }
  },
  DATABASE_EXISTS: (onSuccess?: () => void, onClose?: () => void) => ({
    id: InfiniteMessagesIds.databaseExists,
    message: 'You already have a free Redis Cloud subscription.',
    description:
      'Do you want to import your existing database into Redis Insight?',
    actions: {
      primary: { label: 'Import', onClick: () => onSuccess?.() },
    },
    onClose,
  }),
  DATABASE_IMPORT_FORBIDDEN: (onClose?: () => void) => ({
    id: InfiniteMessagesIds.databaseImportForbidden,
    message: 'Unable to import Cloud database.',
    description: (
      <>
        Adding your Redis Cloud database to Redis Insight is disabled due to a
        setting restricting database connection management.
        <Spacer size="m" />
        Log in to{' '}
        <ExternalLink
          target="_blank"
          variant="inline"
          iconSize="XS"
          tabIndex={-1}
          href={getUtmExternalLink(EXTERNAL_LINKS.cloudConsole, {
            medium: UTM_MEDIUMS.Main,
            campaign: 'disabled_db_management',
          })}
        >
          Redis Cloud
        </ExternalLink>{' '}
        to check your database.
      </>
    ),
    actions: {
      primary: {
        label: 'OK',
        onClick: () => onClose?.(),
      },
    },
    showCloseButton: false,
  }),
  SUBSCRIPTION_EXISTS: (onSuccess?: () => void, onClose?: () => void) => ({
    id: InfiniteMessagesIds.subscriptionExists,
    message: 'Your subscription does not have a free Redis Cloud database.',
    description:
      'Do you want to create a free database in your existing subscription?',
    actions: {
      primary: { label: 'Create', onClick: () => onSuccess?.() },
    },
    onClose,
  }),
  AUTO_CREATING_DATABASE: () => ({
    id: InfiniteMessagesIds.autoCreateDb,
    message: 'Connecting to your database',
    description: 'This may take several minutes, but it is totally worth it!',
    customIcon: LoaderLargeIcon,
  }),
  APP_UPDATE_AVAILABLE: (version: string, onSuccess?: () => void) => ({
    id: InfiniteMessagesIds.appUpdateAvailable,
    message: 'New version is now available',
    description: (
      <>
        With Redis Insight {version} you have access to new useful features and
        optimizations.
        <Spacer size="m" />
        Restart Redis Insight to install updates.
      </>
    ),
    actions: {
      primary: { label: 'Restart', onClick: () => onSuccess?.() },
    },
  }),
  SUCCESS_DEPLOY_PIPELINE: () => ({
    id: InfiniteMessagesIds.pipelineDeploySuccess,
    message: 'Congratulations!',
    description: (
      <>
        Deployment completed successfully!
        <br />
        Check out the pipeline statistics page.
      </>
    ),
    // TODO enable when statistics page will be available
    // actions: {
    //   primary: {
    //     label: 'Statistics',
    //     onClick: () => {},
    //   }
    // }
  }),
}
