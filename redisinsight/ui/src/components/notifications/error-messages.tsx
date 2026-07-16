import React from 'react'

import i18n from 'uiSrc/i18n'
import { InfoIcon, ToastDangerIcon } from 'uiSrc/components/base/icons'

import RdiDeployErrorContent from './components/rdi-deploy-error-content'
import { EncryptionErrorContent, DefaultErrorContent } from './components'
import CloudCapiUnAuthorizedErrorContent from './components/cloud-capi-unauthorized'
import { AzureTokenExpiredErrorContent } from './components/azure-token-expired'
import { PersistentErrorContent } from './components/persistent-error-content'
import { NotificationTextLengthThreshold } from 'uiSrc/components/notifications/constants'
import { handleDownloadButton } from 'uiSrc/utils'

export default {
  DEFAULT: (
    text: any,
    onClose = () => {},
    title: string = i18n.t('notification.error.title.default'),
  ) => {
    const isSafeMessage =
      text.length < NotificationTextLengthThreshold || typeof text !== 'string'

    return {
      'data-testid': 'toast-error',
      customIcon: ToastDangerIcon,
      message: title,
      description: isSafeMessage ? (
        <DefaultErrorContent text={text} />
      ) : undefined,
      actions: {
        secondary: !isSafeMessage
          ? {
              label: i18n.t('notification.error.button.downloadFullLog'),
              closes: true,
              onClick: () =>
                handleDownloadButton(text, 'error-log.txt', onClose),
            }
          : undefined,
      },
    }
  },
  ENCRYPTION: (onClose = () => {}, instanceId = '') => ({
    'data-testid': 'toast-error-encryption',
    customIcon: InfoIcon,
    message: i18n.t('notification.error.encryption.title'),
    description: (
      <EncryptionErrorContent instanceId={instanceId} onClose={onClose} />
    ),
    showCloseButton: false,
  }),
  CLOUD_CAPI_KEY_UNAUTHORIZED: (
    {
      message,
      title,
    }: {
      message: string | JSX.Element
      title?: string
    },
    additionalInfo: Record<string, any>,
    onClose: () => void,
  ) => ({
    'data-testid': 'toast-error-cloud-capi-key-unauthorized',
    customIcon: ToastDangerIcon,
    message: title,
    showCloseButton: false,
    description: (
      <CloudCapiUnAuthorizedErrorContent
        text={message}
        resourceId={additionalInfo.resourceId}
        onClose={onClose}
      />
    ),
  }),
  RDI_DEPLOY_PIPELINE: (
    { title, message }: { title?: string; message: string },
    onClose: () => void,
  ) => ({
    'data-testid': 'toast-error-deploy',
    customIcon: ToastDangerIcon,
    onClose,
    message: title,
    description: <RdiDeployErrorContent message={message} onClose={onClose} />,
  }),
  AZURE_TOKEN_EXPIRED: (
    { message, tenantId }: { message: string | JSX.Element; tenantId?: string },
    onClose: () => void,
  ) => ({
    'data-testid': 'toast-info-azure-token-expired',
    customIcon: InfoIcon,
    showCloseButton: true,
    onClose,
    description: (
      <AzureTokenExpiredErrorContent
        text={message}
        tenantId={tenantId}
        onClose={onClose}
      />
    ),
  }),
  PERSISTENT: (
    {
      message,
      title = i18n.t('notification.error.title.default'),
    }: { message: string; title?: string },
    onClose: () => void,
  ) => ({
    'data-testid': 'toast-error-persistent',
    customIcon: ToastDangerIcon,
    onClose,
    message: title,
    description: <PersistentErrorContent text={message} />,
  }),
}
