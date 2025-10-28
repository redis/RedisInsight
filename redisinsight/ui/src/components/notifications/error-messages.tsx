import React from 'react'

import { riToast } from 'uiSrc/components/base/display/toast'
import { InfoIcon, ToastDangerIcon } from 'uiSrc/components/base/icons'

import RdiDeployErrorContent from './components/rdi-deploy-error-content'
import { EncryptionErrorContent, DefaultErrorContent } from './components'
import CloudCapiUnAuthorizedErrorContent from './components/cloud-capi-unauthorized'
import { defaultContainerId } from './constants'

// TODO: use i18n file for texts
export default {
  DEFAULT: (
    text: any,
    onClose = () => {},
    title: string = 'Error',
    toastId?: string,
  ) =>
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
      {
        variant: riToast.Variant.Danger,
        toastId,
        containerId: defaultContainerId,
      },
    ),
  ENCRYPTION: (onClose = () => {}, instanceId = '', toastId?: string) =>
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
      {
        variant: riToast.Variant.Danger,
        toastId,
        containerId: defaultContainerId,
      },
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
    toastId?: string,
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
      {
        variant: riToast.Variant.Danger,
        toastId,
        containerId: defaultContainerId,
      },
    ),
  RDI_DEPLOY_PIPELINE: (
    { title, message }: { title?: string; message: string },
    onClose: () => void,
    toastId?: string,
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
      {
        variant: riToast.Variant.Danger,
        toastId,
        containerId: defaultContainerId,
      },
    ),
}
