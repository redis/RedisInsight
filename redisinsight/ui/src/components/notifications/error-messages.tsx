import React from 'react'

import { riToast } from 'uiBase/display'
import { InfoIcon, ToastDangerIcon } from 'uiBase/icons'

import RdiDeployErrorContent from './components/rdi-deploy-error-content'
import { EncryptionErrorContent, DefaultErrorContent } from './components'
import CloudCapiUnAuthorizedErrorContent from './components/cloud-capi-unauthorized'

// TODO: use i18n file for texts
export default {
  DEFAULT: (text: any, onClose = () => {}, title: string = 'Error') =>
    riToast(
      {
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
      },
      { variant: riToast.Variant.Danger },
    ),
  ENCRYPTION: (onClose = () => {}, instanceId = '') =>
    riToast(
      {
        'data-testid': 'toast-error-encryption',
        customIcon: InfoIcon,
        message: 'Unable to decrypt',
        description: (
          <EncryptionErrorContent instanceId={instanceId} onClose={onClose} />
        ),
        showCloseButton: false,
      },
      { variant: riToast.Variant.Danger },
    ),
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
  ) =>
    riToast(
      {
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
      },
      { variant: riToast.Variant.Danger },
    ),
  RDI_DEPLOY_PIPELINE: (
    { title, message }: { title?: string; message: string },
    onClose: () => void,
  ) =>
    riToast(
      {
        'data-testid': 'toast-error-deploy',
        customIcon: ToastDangerIcon,
        onClose,
        message: title,
        description: (
          <RdiDeployErrorContent message={message} onClose={onClose} />
        ),
      },
      { variant: riToast.Variant.Danger },
    ),
}
