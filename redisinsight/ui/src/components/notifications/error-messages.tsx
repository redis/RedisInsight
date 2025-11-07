import React from 'react'

import { InfoIcon, ToastDangerIcon } from 'uiSrc/components/base/icons'

import RdiDeployErrorContent from './components/rdi-deploy-error-content'
import { EncryptionErrorContent, DefaultErrorContent } from './components'
import CloudCapiUnAuthorizedErrorContent from './components/cloud-capi-unauthorized'

export default {
  DEFAULT: (text: any, onClose = () => {}, title: string = 'Error') => ({
    'data-testid': 'toast-error',
    customIcon: ToastDangerIcon,
    message: title,
    description: <DefaultErrorContent text={text} />,
    actions: {
      primary: {
        label: 'OK',
        closes: true,
        onClick: onClose,
      },
    },
  }),
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
}
