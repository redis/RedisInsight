import React from 'react'
import { find } from 'lodash'
import i18n, { Trans } from 'uiSrc/i18n'
import { CloudJobName, CloudJobStep } from 'uiSrc/electron/constants'
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
import { Link } from 'uiSrc/components/base/link/Link'

import styles from './styles.module.scss'

// Bold span reused as the <bold> slot for <Trans> interpolated messages.
const bold = (
  <Text variant="semiBold" component="span">
    {''}
  </Text>
)

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
    message: i18n.t('notification.infinite.authenticating.message'),
    description: i18n.t('notification.infinite.authenticating.description'),
    customIcon: LoaderLargeIcon,
  }),
  PENDING_CREATE_DB: (step?: CloudJobStep) => ({
    id: InfiniteMessagesIds.oAuthProgress,
    customIcon: LoaderLargeIcon,
    variation: step,
    message: (
      <>
        {(step === CloudJobStep.Credentials || !step) &&
          i18n.t('notification.infinite.pendingCreateDb.credentials')}
        {step === CloudJobStep.Subscription &&
          i18n.t('notification.infinite.pendingCreateDb.subscription')}
        {step === CloudJobStep.Database &&
          i18n.t('notification.infinite.pendingCreateDb.database')}
        {step === CloudJobStep.Import &&
          i18n.t('notification.infinite.pendingCreateDb.import')}
      </>
    ),
    description: (
      <>
        {i18n.t('notification.infinite.pendingCreateDb.description')}
        <Spacer size="m" />
        {i18n.t('notification.infinite.pendingCreateDb.descriptionContinue')}
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

    return {
      id: InfiniteMessagesIds.oAuthSuccess,
      message: i18n.t('notification.infinite.successCreateDb.message'),
      variant: 'success',
      description: (
        <>
          {withFeed
            ? i18n.t(
                'notification.infinite.successCreateDb.descriptionWithData',
              )
            : i18n.t('notification.infinite.successCreateDb.description')}
          <Spacer size="m" />
          <Trans
            i18nKey="notification.infinite.successCreateDb.notice"
            components={{ bold }}
          />
          {!!details && (
            <>
              <Spacer size="m" />
              <Divider />
              <Spacer size="m" />
              <Row className={styles.detailsRow} justify="between">
                <FlexItem>
                  <Text size="xs">
                    {i18n.t('notification.infinite.successCreateDb.plan')}
                  </Text>
                </FlexItem>
                <FlexItem data-testid="notification-details-plan">
                  <Text size="xs">
                    {i18n.t('notification.infinite.successCreateDb.planFree')}
                  </Text>
                </FlexItem>
              </Row>
              <Row
                className={styles.detailsRow}
                justify="between"
                align="center"
              >
                <FlexItem>
                  <Text size="xs">
                    {i18n.t(
                      'notification.infinite.successCreateDb.cloudVendor',
                    )}
                  </Text>
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
                  <Text size="xs">
                    {i18n.t('notification.infinite.successCreateDb.region')}
                  </Text>
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
              <Link
                external
                target="_blank"
                href={MANAGE_DB_LINK}
                variant="inline"
              >
                {i18n.t(
                  'notification.infinite.successCreateDb.button.manageDb',
                )}
              </Link>
            </FlexItem>
            <FlexItem>
              <PrimaryButton
                size="small"
                onClick={() => onSuccess()}
                data-testid="notification-connect-db"
              >
                {i18n.t('notification.infinite.successCreateDb.button.connect')}
              </PrimaryButton>
            </FlexItem>
          </Row>
        </>
      ),
    }
  },
  DATABASE_EXISTS: (onSuccess?: () => void, onClose?: () => void) => ({
    id: InfiniteMessagesIds.databaseExists,
    message: i18n.t('notification.infinite.databaseExists.message'),
    description: i18n.t('notification.infinite.databaseExists.description'),
    actions: {
      primary: {
        label: i18n.t('notification.infinite.databaseExists.button.import'),
        onClick: () => onSuccess?.(),
      },
    },
    onClose,
  }),
  DATABASE_IMPORT_FORBIDDEN: (onClose?: () => void) => ({
    id: InfiniteMessagesIds.databaseImportForbidden,
    message: i18n.t('notification.infinite.databaseImportForbidden.message'),
    description: (
      <>
        {i18n.t('notification.infinite.databaseImportForbidden.description')}
        <Spacer size="m" />
        <Trans
          i18nKey="notification.infinite.databaseImportForbidden.logIn"
          components={{
            cloudLink: (
              <Link
                external
                target="_blank"
                variant="inline"
                tabIndex={-1}
                href={getUtmExternalLink(EXTERNAL_LINKS.cloudConsole, {
                  medium: UTM_MEDIUMS.Main,
                  campaign: 'disabled_db_management',
                })}
              />
            ),
          }}
        />
      </>
    ),
    actions: {
      primary: {
        label: i18n.t(
          'notification.infinite.databaseImportForbidden.button.ok',
        ),
        onClick: () => onClose?.(),
      },
    },
    showCloseButton: false,
  }),
  SUBSCRIPTION_EXISTS: (onSuccess?: () => void, onClose?: () => void) => ({
    id: InfiniteMessagesIds.subscriptionExists,
    message: i18n.t('notification.infinite.subscriptionExists.message'),
    description: i18n.t('notification.infinite.subscriptionExists.description'),
    actions: {
      primary: {
        label: i18n.t('notification.infinite.subscriptionExists.button.create'),
        onClick: () => onSuccess?.(),
      },
    },
    onClose,
  }),
  AUTO_CREATING_DATABASE: () => ({
    id: InfiniteMessagesIds.autoCreateDb,
    message: i18n.t('notification.infinite.autoCreatingDatabase.message'),
    description: i18n.t(
      'notification.infinite.autoCreatingDatabase.description',
    ),
    customIcon: LoaderLargeIcon,
  }),
  APP_UPDATE_AVAILABLE: (version: string, onSuccess?: () => void) => ({
    id: InfiniteMessagesIds.appUpdateAvailable,
    message: i18n.t('notification.infinite.appUpdateAvailable.message'),
    description: (
      <>
        {i18n.t('notification.infinite.appUpdateAvailable.description', {
          version,
        })}
        <Spacer size="m" />
        {i18n.t('notification.infinite.appUpdateAvailable.descriptionRestart')}
      </>
    ),
    actions: {
      primary: {
        label: i18n.t(
          'notification.infinite.appUpdateAvailable.button.restart',
        ),
        onClick: () => onSuccess?.(),
      },
    },
  }),
  SUCCESS_DEPLOY_PIPELINE: () => ({
    id: InfiniteMessagesIds.pipelineDeploySuccess,
    message: i18n.t('notification.infinite.successDeployPipeline.message'),
    description: (
      <>
        {i18n.t('notification.infinite.successDeployPipeline.description')}
        <br />
        {i18n.t('notification.infinite.successDeployPipeline.descriptionCheck')}
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
