import { ToastVariant } from 'uiSrc/components/base/display/toast/RiToast'
import i18n from 'uiSrc/i18n'

export const loadSampleDatasetFailedNotification = () => ({
  title: i18n.t('notification.error.createArray.title'),
  message: i18n.t('notification.error.createArray.message'),
  variant: 'danger' as ToastVariant,
})

export const sampleDatasetLoadedNotification = (keyName: string) => ({
  title: i18n.t('notification.success.sampleArrayAdded.title'),
  message: i18n.t('notification.success.sampleArrayAdded.message', { keyName }),
  showCloseButton: false,
})

export const sampleDatasetTtlFailedNotification = (keyName: string) => ({
  title: i18n.t('notification.warning.sampleArrayNoTtl.title'),
  message: i18n.t('notification.warning.sampleArrayNoTtl.message', { keyName }),
  variant: 'notice' as ToastVariant,
  showCloseButton: false,
})

// Copy stays generic on purpose: we can verify only that the key exists, not
// that it holds the bundled sample.
export const keyAlreadyExistsNotification = (keyName: string) => ({
  title: i18n.t('notification.warning.keyExists.title'),
  message: i18n.t('notification.warning.keyExists.message', { keyName }),
  variant: 'notice' as ToastVariant,
  showCloseButton: false,
})
