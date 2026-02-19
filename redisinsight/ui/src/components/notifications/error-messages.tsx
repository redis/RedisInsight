import React from 'react'

import { InfoIcon, ToastDangerIcon } from 'uiSrc/components/base/icons'

import RdiDeployErrorContent from './components/rdi-deploy-error-content'
import { EncryptionErrorContent, DefaultErrorContent } from './components'
import CloudCapiUnAuthorizedErrorContent from './components/cloud-capi-unauthorized'
import { AzureTokenExpiredErrorContent } from './components/azure-token-expired'
import { PersistentErrorContent } from './components/persistent-error-content'
import { NotificationTextLengthThreshold } from 'uiSrc/components/notifications/constants'
import { handleDownloadButton } from 'uiSrc/utils'

export default {
  DEFAULT: (text: any, onClose = () => {}, title: string = 'Error') => {
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
              label: 'Download full log',
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
    message: 'Unable to decrypt',
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
    { message }: { message: string | JSX.Element },
    onClose: () => void,
  ) => ({
    'data-testid': 'toast-info-azure-token-expired',
    customIcon: InfoIcon,
    showCloseButton: false,
    description: (
      <AzureTokenExpiredErrorContent text={message} onClose={onClose} />
    ),
  }),
  PERSISTENT: (
    { message, title }: { message: string; title?: string },
    onClose: () => void,
  ) => ({
    'data-testid': 'toast-error-persistent',
    customIcon: ToastDangerIcon,
    onClose,
    message: title,
    description: <PersistentErrorContent text={message} />,
  }),
}
